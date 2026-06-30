use anchor_lang::prelude::*;

use crate::constants::{MARKET_SEED, VAULT_SEED};
use crate::events::MarketCreated;
use crate::state::market::{Market, Outcome};

/// TxLINE binding supplied at market creation so the market can later be settled
/// trustlessly from a `validate_stat` Merkle proof. Pass `fixture_id = 0` for a
/// legacy market that will only ever use the oracle-authority path.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct TxlineBinding {
    pub fixture_id: i64,
    pub home_goal_key: u32,
    pub away_goal_key: u32,
    pub goal_period: i32,
    pub settle_not_before: i64,
}

#[derive(Accounts)]
#[instruction(match_id: String)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + Market::INIT_SPACE,
        seeds = [MARKET_SEED, match_id.as_bytes()],
        bump,
    )]
    pub market: Account<'info, Market>,

    /// SOL vault PDA for this market. Created lazily on the first bet transfer;
    /// declared here so the address is anchored to the market at creation time.
    /// CHECK: PDA owned by the System Program, validated by seeds.
    #[account(
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_market_handler(
    ctx: Context<CreateMarket>,
    match_id: String,
    home_team: String,
    away_team: String,
    match_timestamp: i64,
    oracle_authority: Pubkey,
    binding: TxlineBinding,
) -> Result<()> {
    let market = &mut ctx.accounts.market;

    market.match_id = match_id.clone();
    market.home_team = home_team.clone();
    market.away_team = away_team.clone();
    market.match_timestamp = match_timestamp;
    market.outcome = Outcome::Unresolved;
    market.total_home_pool = 0;
    market.total_away_pool = 0;
    market.total_draw_pool = 0;
    market.oracle_authority = oracle_authority;
    market.is_settled = false;
    market.bump = ctx.bumps.market;

    // TxLINE trustless-settlement binding.
    market.fixture_id = binding.fixture_id;
    market.home_goal_key = binding.home_goal_key;
    market.away_goal_key = binding.away_goal_key;
    market.goal_period = binding.goal_period;
    // Default the finality gate to kickoff + 2h15m if the caller didn't set one.
    market.settle_not_before = if binding.settle_not_before > 0 {
        binding.settle_not_before
    } else {
        match_timestamp.saturating_add(8100)
    };
    market.settlement_kind = 0;

    emit!(MarketCreated {
        market: market.key(),
        match_id,
        home_team,
        away_team,
        match_timestamp,
        oracle_authority,
        fixture_id: binding.fixture_id,
    });

    Ok(())
}

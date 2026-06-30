use anchor_lang::prelude::*;

use crate::constants::MARKET_SEED;
use crate::errors::VaultError;
use crate::events::MarketResolved;
use crate::state::market::{Market, Outcome};

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    /// Must be the oracle authority recorded on the market.
    pub oracle_authority: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED, market.match_id.as_bytes()],
        bump = market.bump,
        has_one = oracle_authority @ VaultError::UnauthorizedOracle,
    )]
    pub market: Account<'info, Market>,
}

pub fn resolve_market_handler(ctx: Context<ResolveMarket>, outcome: Outcome) -> Result<()> {
    require!(
        outcome != Outcome::Unresolved,
        VaultError::InvalidOutcome
    );

    let market = &mut ctx.accounts.market;
    require!(!market.is_settled, VaultError::MarketAlreadySettled);

    market.outcome = outcome;
    market.is_settled = true;
    market.settlement_kind = 1;

    emit!(MarketResolved {
        market: market.key(),
        match_id: market.match_id.clone(),
        outcome,
    });

    Ok(())
}

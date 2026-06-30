use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

use crate::constants::{BET_SEED, BPS_DENOMINATOR, FEE_BPS, MARKET_SEED, VAULT_SEED};
use crate::errors::VaultError;
use crate::events::PayoutClaimed;
use crate::state::bet::Bet;
use crate::state::market::Market;

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        seeds = [MARKET_SEED, market.match_id.as_bytes()],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,

    /// SOL vault holding all stakes for this market.
    /// CHECK: PDA owned by the System Program, validated by seeds.
    #[account(
        mut,
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        mut,
        seeds = [BET_SEED, market.key().as_ref(), bettor.key().as_ref()],
        bump = bet.bump,
        has_one = bettor,
        has_one = market,
    )]
    pub bet: Account<'info, Bet>,

    pub system_program: Program<'info, System>,
}

pub fn claim_payout_handler(ctx: Context<ClaimPayout>) -> Result<()> {
    let market = &ctx.accounts.market;
    require!(market.is_settled, VaultError::MarketNotSettled);

    let bet = &mut ctx.accounts.bet;
    require!(!bet.claimed, VaultError::AlreadyClaimed);
    // Only the winning side can claim.
    require!(
        bet.predicted_outcome == market.outcome,
        VaultError::InvalidOutcome
    );

    let winning_pool = market.pool_for(market.outcome);
    let total_pool = market.total_pool();
    // Winner check above guarantees winning_pool >= bet.amount > 0.
    require!(winning_pool > 0, VaultError::InvalidOutcome);

    // payout = bet.amount * total_pool * (1 - fee) / winning_pool
    // Computed in u128 to avoid overflow / precision loss, fee applied as bps.
    let net_bps = BPS_DENOMINATOR
        .checked_sub(FEE_BPS)
        .ok_or(VaultError::MathOverflow)?;
    let payout = (bet.amount as u128)
        .checked_mul(total_pool as u128)
        .ok_or(VaultError::MathOverflow)?
        .checked_mul(net_bps as u128)
        .ok_or(VaultError::MathOverflow)?
        .checked_div(BPS_DENOMINATOR as u128)
        .ok_or(VaultError::MathOverflow)?
        .checked_div(winning_pool as u128)
        .ok_or(VaultError::MathOverflow)? as u64;

    // Transfer the payout out of the vault PDA (PDA signs via seeds).
    let market_key = market.key();
    let vault_bump = ctx.bumps.vault;
    let signer_seeds: &[&[&[u8]]] = &[&[VAULT_SEED, market_key.as_ref(), &[vault_bump]]];

    system_program::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.key(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.bettor.to_account_info(),
            },
            signer_seeds,
        ),
        payout,
    )?;

    bet.claimed = true;

    emit!(PayoutClaimed {
        market: market_key,
        bettor: ctx.accounts.bettor.key(),
        amount: payout,
    });

    Ok(())
}

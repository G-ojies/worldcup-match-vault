use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};

use crate::constants::{BET_SEED, MARKET_SEED, VAULT_SEED};
use crate::errors::VaultError;
use crate::events::BetPlaced;
use crate::state::bet::Bet;
use crate::state::market::{Market, Outcome};

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub bettor: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED, market.match_id.as_bytes()],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,

    /// SOL vault that accumulates every stake for this market.
    /// CHECK: PDA owned by the System Program, validated by seeds.
    #[account(
        mut,
        seeds = [VAULT_SEED, market.key().as_ref()],
        bump,
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        init,
        payer = bettor,
        space = 8 + Bet::INIT_SPACE,
        seeds = [BET_SEED, market.key().as_ref(), bettor.key().as_ref()],
        bump,
    )]
    pub bet: Account<'info, Bet>,

    pub system_program: Program<'info, System>,
}

pub fn place_bet_handler(
    ctx: Context<PlaceBet>,
    predicted_outcome: Outcome,
    amount: u64,
) -> Result<()> {
    require!(amount > 0, VaultError::ZeroAmount);
    require!(
        predicted_outcome != Outcome::Unresolved,
        VaultError::InvalidOutcome
    );

    let market = &mut ctx.accounts.market;
    require!(!market.is_settled, VaultError::MarketAlreadySettled);
    require!(
        market.outcome == Outcome::Unresolved,
        VaultError::MarketAlreadySettled
    );

    // Reject bets at or after kickoff.
    let now = Clock::get()?.unix_timestamp;
    require!(now < market.match_timestamp, VaultError::BetAfterMatchStart);

    // Move the stake into the vault PDA via a System Program CPI.
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.key(),
            Transfer {
                from: ctx.accounts.bettor.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        ),
        amount,
    )?;

    // Update the on-chain ledger.
    match predicted_outcome {
        Outcome::Home => {
            market.total_home_pool = market
                .total_home_pool
                .checked_add(amount)
                .ok_or(VaultError::MathOverflow)?
        }
        Outcome::Away => {
            market.total_away_pool = market
                .total_away_pool
                .checked_add(amount)
                .ok_or(VaultError::MathOverflow)?
        }
        Outcome::Draw => {
            market.total_draw_pool = market
                .total_draw_pool
                .checked_add(amount)
                .ok_or(VaultError::MathOverflow)?
        }
        Outcome::Unresolved => return err!(VaultError::InvalidOutcome),
    }

    let bet = &mut ctx.accounts.bet;
    bet.market = market.key();
    bet.bettor = ctx.accounts.bettor.key();
    bet.predicted_outcome = predicted_outcome;
    bet.amount = amount;
    bet.claimed = false;
    bet.bump = ctx.bumps.bet;

    emit!(BetPlaced {
        market: market.key(),
        bettor: bet.bettor,
        predicted_outcome,
        amount,
    });

    Ok(())
}

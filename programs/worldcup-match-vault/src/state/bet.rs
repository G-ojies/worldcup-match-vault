use anchor_lang::prelude::*;

use crate::state::market::Outcome;

/// A single bettor's stake on one market.
///
/// PDA: ["bet", market, bettor]. One bet account per (market, wallet) pair.
#[account]
#[derive(InitSpace)]
pub struct Bet {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub predicted_outcome: Outcome,
    pub amount: u64,
    pub claimed: bool,
    pub bump: u8,
}

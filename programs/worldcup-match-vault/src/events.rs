use anchor_lang::prelude::*;

use crate::state::market::Outcome;

#[event]
pub struct MarketCreated {
    pub market: Pubkey,
    pub match_id: String,
    pub home_team: String,
    pub away_team: String,
    pub match_timestamp: i64,
    pub oracle_authority: Pubkey,
    pub fixture_id: i64,
}

#[event]
pub struct BetPlaced {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub predicted_outcome: Outcome,
    pub amount: u64,
}

#[event]
pub struct MarketResolved {
    pub market: Pubkey,
    pub match_id: String,
    pub outcome: Outcome,
}

/// Emitted when a market is settled trustlessly from a TxLINE `validate_stat`
/// Merkle proof. No oracle authority involved.
#[event]
pub struct MarketResolvedTrustless {
    pub market: Pubkey,
    pub match_id: String,
    pub fixture_id: i64,
    pub outcome: Outcome,
    pub home_goals: i32,
    pub away_goals: i32,
    /// Unix time of the proven scores batch (TxLINE update timestamp).
    pub proof_ts: i64,
    /// Resolver who submitted the proof (permissionless).
    pub resolver: Pubkey,
}

#[event]
pub struct PayoutClaimed {
    pub market: Pubkey,
    pub bettor: Pubkey,
    pub amount: u64,
}

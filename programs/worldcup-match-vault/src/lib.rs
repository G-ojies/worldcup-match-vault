pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;
pub mod txline_cpi;

use anchor_lang::prelude::*;

pub use constants::*;
pub use errors::*;
pub use events::*;
pub use instructions::*;
pub use state::*;
pub use txline_cpi::{ProofNode, ScoresBatchSummary, StatTerm};

declare_id!("E5ffcawirq6hVse98NJVDGQ4RSkkNAYWzN2RNoRAikzJ");

#[program]
pub mod worldcup_match_vault {
    use super::*;

    /// Admin creates a prediction market for a specific World Cup match.
    /// `binding` ties the market to a TxLINE fixture for trustless settlement.
    pub fn create_market(
        ctx: Context<CreateMarket>,
        match_id: String,
        home_team: String,
        away_team: String,
        match_timestamp: i64,
        oracle_authority: Pubkey,
        binding: instructions::create_market::TxlineBinding,
    ) -> Result<()> {
        instructions::create_market::create_market_handler(
            ctx,
            match_id,
            home_team,
            away_team,
            match_timestamp,
            oracle_authority,
            binding,
        )
    }

    /// User places a SOL bet on an outcome (Home / Away / Draw).
    pub fn place_bet(ctx: Context<PlaceBet>, predicted_outcome: Outcome, amount: u64) -> Result<()> {
        instructions::place_bet::place_bet_handler(ctx, predicted_outcome, amount)
    }

    /// Legacy path: a registered oracle authority submits the final outcome.
    pub fn resolve_market(ctx: Context<ResolveMarket>, outcome: Outcome) -> Result<()> {
        instructions::resolve_market::resolve_market_handler(ctx, outcome)
    }

    /// Trustless path: settle the market from a TxLINE `validate_stat` Merkle
    /// proof of the final goals. No oracle authority. Anyone can submit the
    /// proof and the market settles only if TxLINE's program confirms it.
    pub fn resolve_market_trustless(
        ctx: Context<ResolveMarketTrustless>,
        claimed_outcome: Outcome,
        ts: i64,
        fixture_summary: ScoresBatchSummary,
        fixture_proof: Vec<ProofNode>,
        main_tree_proof: Vec<ProofNode>,
        stat_home: StatTerm,
        stat_away: StatTerm,
    ) -> Result<()> {
        instructions::resolve_market_trustless::resolve_market_trustless_handler(
            ctx,
            claimed_outcome,
            ts,
            fixture_summary,
            fixture_proof,
            main_tree_proof,
            stat_home,
            stat_away,
        )
    }

    /// Winning bettor claims their proportional share of the pools (minus protocol fee).
    pub fn claim_payout(ctx: Context<ClaimPayout>) -> Result<()> {
        instructions::claim_payout::claim_payout_handler(ctx)
    }
}

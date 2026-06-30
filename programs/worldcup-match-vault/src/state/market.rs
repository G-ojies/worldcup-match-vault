use anchor_lang::prelude::*;

/// Possible final results for a match. `Unresolved` is the pre-settlement state.
#[derive(
    AnchorSerialize, AnchorDeserialize, InitSpace, Clone, Copy, PartialEq, Eq, Debug, Default,
)]
pub enum Outcome {
    #[default]
    Unresolved,
    Home,
    Away,
    Draw,
}

/// A prediction market for a single World Cup match.
///
/// PDA: ["market", match_id]. All staked SOL lives in the sibling vault PDA
/// (["vault", market]); the per-outcome totals below are the on-chain ledger
/// used to compute proportional payouts.
#[account]
#[derive(InitSpace)]
pub struct Market {
    /// TxODDS match identifier (e.g. "WC2026_001").
    #[max_len(64)]
    pub match_id: String,
    #[max_len(48)]
    pub home_team: String,
    #[max_len(48)]
    pub away_team: String,
    /// Unix timestamp of kickoff. Bets are rejected at/after this time.
    pub match_timestamp: i64,
    /// Final outcome; `Unresolved` until the oracle settles.
    pub outcome: Outcome,
    pub total_home_pool: u64,
    pub total_away_pool: u64,
    pub total_draw_pool: u64,
    /// The only key allowed to resolve this market via the legacy oracle path.
    pub oracle_authority: Pubkey,
    pub is_settled: bool,
    pub bump: u8,

    // ---- TxLINE trustless-settlement binding ----
    /// TxLINE numeric fixture id this market tracks (0 = none / legacy market).
    pub fixture_id: i64,
    /// TxLINE score-stat key for the HOME participant's goals (period-encoded).
    pub home_goal_key: u32,
    /// TxLINE score-stat key for the AWAY participant's goals (period-encoded).
    pub away_goal_key: u32,
    /// Stat period the goal keys belong to (full-time period).
    pub goal_period: i32,
    /// Earliest unix time a trustless settlement is accepted (kickoff + full time).
    pub settle_not_before: i64,
    /// How this market was settled: 0 = unsettled, 1 = oracle, 2 = TxLINE proof.
    pub settlement_kind: u8,
}

impl Market {
    /// Total SOL staked across all three outcomes.
    pub fn total_pool(&self) -> u64 {
        self.total_home_pool
            .saturating_add(self.total_away_pool)
            .saturating_add(self.total_draw_pool)
    }

    /// The pool corresponding to a given outcome (0 for `Unresolved`).
    pub fn pool_for(&self, outcome: Outcome) -> u64 {
        match outcome {
            Outcome::Home => self.total_home_pool,
            Outcome::Away => self.total_away_pool,
            Outcome::Draw => self.total_draw_pool,
            Outcome::Unresolved => 0,
        }
    }
}

use anchor_lang::prelude::*;

use crate::constants::MARKET_SEED;
use crate::errors::VaultError;
use crate::events::MarketResolvedTrustless;
use crate::state::market::{Market, Outcome};
use crate::txline_cpi::{
    validate_stat_cpi, BinaryExpression, Comparison, ProofNode, ScoresBatchSummary, StatTerm,
    TraderPredicate, ValidateStatArgs,
};

/// Settle a market **without any trusted authority** by proving the final goal
/// difference against TxLINE's on-chain daily-scores Merkle root.
///
/// The resolver (anyone) submits the `validate_stat` proof bundle for the two
/// goal stats (home and away). This program:
///   1. binds the proof to *this* market's fixture and configured goal stats,
///   2. enforces the match is past full time,
///   3. derives the predicate from the *claimed* outcome (home: H−A>0,
///      away: H−A<0, draw: H−A=0) so the claim is bound to the proof,
///   4. CPIs `validate_stat`; the market settles only if TxLINE's program
///      cryptographically confirms the predicate against its signed root.
///
/// A liar cannot settle: a false claim makes `validate_stat` return `false`.
#[derive(Accounts)]
pub struct ResolveMarketTrustless<'info> {
    /// Permissionless. Anyone can settle once a valid proof exists.
    pub resolver: Signer<'info>,

    #[account(
        mut,
        seeds = [MARKET_SEED, market.match_id.as_bytes()],
        bump = market.bump,
    )]
    pub market: Account<'info, Market>,

    /// TxLINE `["daily_scores_roots", epoch_day]` PDA for the match day.
    /// CHECK: validated inside TxLINE's `validate_stat` against its own seeds.
    pub daily_scores_merkle_roots: UncheckedAccount<'info>,

    /// The TxLINE program. CHECK: key is asserted to equal TXLINE_PROGRAM_ID in the CPI.
    pub txline_program: UncheckedAccount<'info>,
}

#[allow(clippy::too_many_arguments)]
pub fn resolve_market_trustless_handler(
    ctx: Context<ResolveMarketTrustless>,
    claimed_outcome: Outcome,
    ts: i64,
    fixture_summary: ScoresBatchSummary,
    fixture_proof: Vec<ProofNode>,
    main_tree_proof: Vec<ProofNode>,
    stat_home: StatTerm,
    stat_away: StatTerm,
) -> Result<()> {
    let market = &mut ctx.accounts.market;

    require!(market.fixture_id != 0, VaultError::NoFixtureBound);
    require!(!market.is_settled, VaultError::MarketAlreadySettled);
    require!(
        claimed_outcome != Outcome::Unresolved,
        VaultError::InvalidOutcome
    );

    // 1. Finality: never settle before full time.
    let now = Clock::get()?.unix_timestamp;
    require!(now >= market.settle_not_before, VaultError::MatchNotFinished);

    // 2. Bind the proof to THIS market's fixture and require the proven batch to
    //    extend at least to full time (so it reflects a final, not in-play, score).
    require!(
        fixture_summary.fixture_id == market.fixture_id,
        VaultError::FixtureMismatch
    );
    // TxLINE update timestamps are milliseconds; settle_not_before is unix seconds.
    let proof_max_secs = fixture_summary
        .update_stats
        .max_timestamp
        .checked_div(1000)
        .ok_or(VaultError::StaleProof)?;
    require!(
        proof_max_secs >= market.settle_not_before,
        VaultError::StaleProof
    );

    // 3. Bind the stat leaves to the market's configured goal keys/period.
    require!(
        stat_home.stat_to_prove.key == market.home_goal_key
            && stat_home.stat_to_prove.period == market.goal_period,
        VaultError::StatKeyMismatch
    );
    require!(
        stat_away.stat_to_prove.key == market.away_goal_key
            && stat_away.stat_to_prove.period == market.goal_period,
        VaultError::StatKeyMismatch
    );

    let home_goals = stat_home.stat_to_prove.value;
    let away_goals = stat_away.stat_to_prove.value;

    // 4. Derive the predicate from the claimed outcome (expr = home − away).
    let comparison = match claimed_outcome {
        Outcome::Home => Comparison::GreaterThan,
        Outcome::Away => Comparison::LessThan,
        Outcome::Draw => Comparison::EqualTo,
        Outcome::Unresolved => return err!(VaultError::InvalidOutcome),
    };

    let args = ValidateStatArgs {
        ts,
        fixture_summary,
        fixture_proof,
        main_tree_proof,
        predicate: TraderPredicate {
            threshold: 0,
            comparison,
        },
        stat_a: stat_home,
        stat_b: Some(stat_away),
        op: Some(BinaryExpression::Subtract),
    };

    // 5. Trustless check: TxLINE's program must confirm the predicate from its root.
    let ok = validate_stat_cpi(
        &ctx.accounts.daily_scores_merkle_roots.to_account_info(),
        &ctx.accounts.txline_program.to_account_info(),
        &args,
    )?;
    require!(ok, VaultError::ProofOutcomeMismatch);

    market.outcome = claimed_outcome;
    market.is_settled = true;
    market.settlement_kind = 2;

    emit!(MarketResolvedTrustless {
        market: market.key(),
        match_id: market.match_id.clone(),
        fixture_id: market.fixture_id,
        outcome: claimed_outcome,
        home_goals,
        away_goals,
        proof_ts: ts,
        resolver: ctx.accounts.resolver.key(),
    });

    Ok(())
}

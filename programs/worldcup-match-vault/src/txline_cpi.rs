//! Trustless settlement primitive: a cross-program invocation into the TxODDS
//! TxLINE on-chain program's `validate_stat` instruction.
//!
//! `validate_stat` proves a single score statistic (or a binary expression over
//! two statistics) against TxLINE's daily Merkle root of signed scores, anchored
//! on-chain by TxODDS. It returns a `bool`: whether the supplied `predicate`
//! holds for the *Merkle-proven* stat value. Because the proof is verified
//! against TxODDS's own on-chain root, the caller cannot forge a result — there
//! is **no trusted oracle authority** in the settlement path, only cryptography.
//!
//! These structs mirror the TxLINE devnet IDL (`txoracle` v1.5.2) byte-for-byte
//! so we can Borsh-serialize the instruction data and read back the returned
//! bool via `get_return_data`.

use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::{AccountMeta, Instruction},
    program::{get_return_data, invoke},
    pubkey::Pubkey,
};

/// Anchor discriminator for `validate_stat` (from the TxLINE IDL).
pub const VALIDATE_STAT_DISCRIMINATOR: [u8; 8] = [107, 197, 232, 90, 191, 136, 105, 185];

/// TxLINE program id — devnet (`6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`).
/// (Mainnet: `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA`.)
pub const TXLINE_PROGRAM_ID: Pubkey = Pubkey::new_from_array([
    86, 117, 159, 44, 144, 95, 120, 96, 200, 99, 119, 20, 191, 36, 145, 48, 157, 192, 113, 129,
    81, 63, 122, 36, 191, 62, 218, 248, 127, 119, 80, 3,
]);

/// PDA seed for TxLINE's daily scores Merkle roots account: ["daily_scores_roots", epoch_day_le_u16].
pub const DAILY_SCORES_ROOTS_SEED: &[u8] = b"daily_scores_roots";

// ---- IDL-mirrored types (must match TxLINE's Borsh layout exactly) ----

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ScoresUpdateStats {
    pub update_count: i32,
    pub min_timestamp: i64,
    pub max_timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ScoresBatchSummary {
    pub fixture_id: i64,
    pub update_stats: ScoresUpdateStats,
    pub events_sub_tree_root: [u8; 32],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ProofNode {
    pub hash: [u8; 32],
    pub is_right_sibling: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ScoreStat {
    pub key: u32,
    pub value: i32,
    pub period: i32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct StatTerm {
    pub stat_to_prove: ScoreStat,
    pub event_stat_root: [u8; 32],
    pub stat_proof: Vec<ProofNode>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum Comparison {
    GreaterThan,
    LessThan,
    EqualTo,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub struct TraderPredicate {
    pub threshold: i32,
    pub comparison: Comparison,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub enum BinaryExpression {
    Add,
    Subtract,
}

/// Full argument set for `validate_stat`, in IDL order.
#[derive(AnchorSerialize, Clone, Debug)]
pub struct ValidateStatArgs {
    pub ts: i64,
    pub fixture_summary: ScoresBatchSummary,
    pub fixture_proof: Vec<ProofNode>,
    pub main_tree_proof: Vec<ProofNode>,
    pub predicate: TraderPredicate,
    pub stat_a: StatTerm,
    pub stat_b: Option<StatTerm>,
    pub op: Option<BinaryExpression>,
}

/// CPI into TxLINE `validate_stat` and decode the returned bool.
///
/// * `daily_scores_roots` — TxLINE's `["daily_scores_roots", epoch_day]` PDA.
/// * `txline_program` — the TxLINE program account (must equal [`TXLINE_PROGRAM_ID`]).
///
/// Returns `Ok(true)` iff the Merkle-proven stat satisfies `args.predicate`.
pub fn validate_stat_cpi<'a>(
    daily_scores_roots: &AccountInfo<'a>,
    txline_program: &AccountInfo<'a>,
    args: &ValidateStatArgs,
) -> Result<bool> {
    require_keys_eq!(
        *txline_program.key,
        TXLINE_PROGRAM_ID,
        crate::errors::VaultError::WrongTxlineProgram
    );

    let mut data = Vec::with_capacity(256);
    data.extend_from_slice(&VALIDATE_STAT_DISCRIMINATOR);
    args.serialize(&mut data)?;

    let ix = Instruction {
        program_id: TXLINE_PROGRAM_ID,
        accounts: vec![AccountMeta::new_readonly(*daily_scores_roots.key, false)],
        data,
    };

    invoke(
        &ix,
        &[daily_scores_roots.clone(), txline_program.clone()],
    )?;

    // `validate_stat` returns a Borsh `bool` (1 byte) via set_return_data.
    let (returning_program, ret) =
        get_return_data().ok_or(crate::errors::VaultError::NoValidationReturn)?;
    require_keys_eq!(
        returning_program,
        TXLINE_PROGRAM_ID,
        crate::errors::VaultError::WrongTxlineProgram
    );

    Ok(ret.first().copied() == Some(1))
}

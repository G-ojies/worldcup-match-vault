use anchor_lang::prelude::*;

/// PDA seed for a Market account: ["market", match_id].
#[constant]
pub const MARKET_SEED: &[u8] = b"market";

/// PDA seed for a Bet account: ["bet", market, bettor].
#[constant]
pub const BET_SEED: &[u8] = b"bet";

/// PDA seed for the per-market SOL vault: ["vault", market].
#[constant]
pub const VAULT_SEED: &[u8] = b"vault";

/// Protocol fee in basis points (3%). Deducted from gross payouts.
#[constant]
pub const FEE_BPS: u64 = 300;

/// Basis-point denominator.
pub const BPS_DENOMINATOR: u64 = 10_000;

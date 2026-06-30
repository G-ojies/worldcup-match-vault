use anchor_lang::prelude::*;

#[error_code]
pub enum VaultError {
    #[msg("Market has already been settled")]
    MarketAlreadySettled,
    #[msg("Cannot place a bet at or after match kickoff")]
    BetAfterMatchStart,
    #[msg("Signer is not the authorized oracle for this market")]
    UnauthorizedOracle,
    #[msg("This bet has already been claimed")]
    AlreadyClaimed,
    #[msg("Invalid outcome for this operation")]
    InvalidOutcome,
    #[msg("Market has not been settled yet")]
    MarketNotSettled,
    #[msg("Bet amount must be greater than zero")]
    ZeroAmount,
    #[msg("Arithmetic overflow")]
    MathOverflow,
    // ---- trustless (validate_stat CPI) settlement ----
    #[msg("Provided account is not the TxLINE program")]
    WrongTxlineProgram,
    #[msg("TxLINE validate_stat returned no data")]
    NoValidationReturn,
    #[msg("TxLINE proof does not satisfy the claimed outcome's predicate")]
    ProofOutcomeMismatch,
    #[msg("Proof is for a different fixture than this market")]
    FixtureMismatch,
    #[msg("Proof stat key/period does not match the market's configured goal stats")]
    StatKeyMismatch,
    #[msg("Match cannot be settled before full time")]
    MatchNotFinished,
    #[msg("Proof predates full time; not a final score")]
    StaleProof,
    #[msg("This market has no TxLINE fixture bound for trustless settlement")]
    NoFixtureBound,
}

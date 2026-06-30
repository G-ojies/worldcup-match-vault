pub mod claim_payout;
pub mod create_market;
pub mod place_bet;
pub mod resolve_market;
pub mod resolve_market_trustless;

// Glob re-export is required so Anchor's generated `__client_accounts_*` and
// `__cpi_client_accounts_*` modules reach the crate root for `#[program]`.
// Handlers are uniquely named per module to avoid a glob collision.
pub use claim_payout::*;
pub use create_market::*;
pub use place_bet::*;
pub use resolve_market::*;
pub use resolve_market_trustless::*;

use anchor_lang::prelude::*;

const DISCRIMINATOR: usize = 8;
pub const VOTING_INFO_SEED: &[u8] = b"janecek-voting-seed";

#[account]
pub struct VotingInfo {
    pub voting_authority: Pubkey,
    pub emergency: bool,
    pub voting_started: i64,
    pub voting_ends: i64,
    pub voting_timestamp: i64,
    pub voting_state: VotingState,
    pub bump: u8,
}

impl VotingInfo {
    pub const LEN: usize = DISCRIMINATOR + 32 + 1 + 8 + 8 + 8 + 1 + 1;
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum VotingState {
    Initialized = 0,
    Registrations = 2,
    Voting = 1,
}

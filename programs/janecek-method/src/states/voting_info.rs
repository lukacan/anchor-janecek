use anchor_lang::prelude::*;

const DISCRIMINATOR: usize = 8;
pub const VOTING_INFO_SEED: &[u8] = b"janecek-voting-seed";

#[account]
pub struct VotingInfo {
    pub voting_authority: Pubkey,
    pub emergency: bool,
    pub bump: u8,
}

impl VotingInfo {
    pub const LEN: usize = DISCRIMINATOR + 32 + 1 + 1;
}

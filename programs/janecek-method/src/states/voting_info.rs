use anchor_lang::prelude::*;

const DISCRIMINATOR: usize = 8;
pub const BRIDGE_SEED: &[u8] = b"janecek-bridge-seed";

#[account]
pub struct VotingInfo {
    pub voting_authority: Pubkey,
    pub bump: u8,
}

impl VotingInfo {
    pub const LEN: usize = DISCRIMINATOR + 32 + 1;
}

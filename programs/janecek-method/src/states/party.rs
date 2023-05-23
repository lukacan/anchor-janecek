use anchor_lang::prelude::*;

const DISCRIMINATOR: usize = 8;
pub const PARTY_SEED: &[u8] = b"janecek-party-seed";
#[account]
pub struct Party {
    pub party_creator: Pubkey,
    pub voting_info: Pubkey,
    pub votes: i64,
    pub created: i64,
    pub bump: u8,
}

impl Party {
    pub const LEN: usize = DISCRIMINATOR + 32 + 32 + 8 + 8 + 1;
}

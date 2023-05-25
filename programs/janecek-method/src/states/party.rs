use anchor_lang::prelude::*;

const DISCRIMINATOR: usize = 8;
pub const PARTY_SEED: &[u8] = b"janecek-party-seed";
pub const METADATA_SEED: &[u8] = b"metadata";

#[account]
pub struct Party {
    pub party_creator: Pubkey,
    pub voting_info: Pubkey,
    pub have_nft: bool,
    pub master_mint: Pubkey,
    pub master_token: Pubkey,
    pub master_metadata: Pubkey,
    pub master_edition: Pubkey,
    pub votes: i64,
    pub created: i64,
    pub bump: u8,
}

impl Party {
    pub const LEN: usize = DISCRIMINATOR + 32 + 32 + 1 + 32 + 32 + 32 + 32 + 8 + 8 + 1;
}

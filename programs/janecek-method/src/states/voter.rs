use anchor_lang::prelude::*;

pub const VOTER_SEED: &[u8] = b"janecek-voter-seed";
const DISCRIMINATOR: usize = 8;

#[account]
pub struct Voter {
    pub voter_authority: Pubkey,
    pub voting_info: Pubkey,
    pub num_votes: NumVotes,
    pub pos1: Pubkey,
    pub pos2: Pubkey,
    pub neg1: Pubkey,
    pub bump: u8,
}

impl Voter {
    pub const LEN: usize = DISCRIMINATOR + 32 + 32 + 1 + 32 + 32 + 32 + 1;
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub enum NumVotes {
    Zero = 0,
    One = 1,
    Two = 2,
    Three = 3,
}

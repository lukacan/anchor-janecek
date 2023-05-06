#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use instructions::*;

pub mod error;
pub mod instructions;
pub mod states;

declare_id!("CMBTneJJ1youyuhCW6rwwxmgy2Cb2vRuSECRjkMFmg9k");

#[program]
pub mod janecek_method {
    use super::*;

    pub fn initialize_voting(
        ctx: Context<InitializeVoting>,
        voting_authority: Pubkey,
    ) -> Result<()> {
        instructions::initialize_voting(ctx, voting_authority)
    }

    pub fn update_voting_info(
        ctx: Context<UpdateVotingInfo>,
        new_voting_authority: Pubkey,
    ) -> Result<()> {
        instructions::update_voting_info(ctx, new_voting_authority)
    }
}

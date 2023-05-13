#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use instructions::*;

pub mod error;
pub mod instructions;
pub mod states;

declare_id!("fZiPQcexEoTQJxdzwKEaCwMTMtnX1b7PSjPmoBoM3mj");

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
    pub fn stop_voting(ctx: Context<SetEmergency>) -> Result<()> {
        instructions::stop_voting(ctx)
    }
    pub fn reset_voting(ctx: Context<SetEmergency>) -> Result<()> {
        instructions::reset_voting(ctx)
    }
    pub fn add_party(ctx: Context<AddParty>) -> Result<()> {
        instructions::add_party(ctx)
    }
    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        instructions::mint_nft(ctx)
    }
}

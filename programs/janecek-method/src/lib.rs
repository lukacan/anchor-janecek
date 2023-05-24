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

    pub fn initialize_voting(ctx: Context<InitializeVoting>) -> Result<()> {
        instructions::initialize(ctx)
    }
    pub fn stop_voting(ctx: Context<UpdateVotingInfo>) -> Result<()> {
        instructions::stop_voting(ctx)
    }
    pub fn reset_voting(ctx: Context<UpdateVotingInfo>) -> Result<()> {
        instructions::reset_voting(ctx)
    }
    pub fn change_default_timestamp(
        ctx: Context<UpdateVotingInfo>,
        new_timestamp: i64,
    ) -> Result<()> {
        instructions::change_default_timestamp(ctx, new_timestamp)
    }
    pub fn start_registrations(ctx: Context<UpdateVotingInfo>) -> Result<()> {
        instructions::start_registrations(ctx)
    }
    pub fn start_voting(ctx: Context<UpdateVotingInfo>) -> Result<()> {
        instructions::start_voting(ctx)
    }
    pub fn add_party_nft(
        ctx: Context<AddPartyNFT>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::add_party_nft(ctx, name, symbol, uri)
    }
    pub fn add_party(ctx: Context<AddParty>) -> Result<()> {
        instructions::add_party(ctx)
    }
    pub fn create_voter(ctx: Context<CreateVoter>) -> Result<()> {
        instructions::create_voter(ctx)
    }
    pub fn vote_pos_nft(ctx: Context<VoteNFT>) -> Result<()> {
        instructions::vote_pos_nft(ctx)
    }
    pub fn vote_pos(ctx: Context<Vote>) -> Result<()> {
        instructions::vote_pos(ctx)
    }
    pub fn vote_neg(ctx: Context<Vote>) -> Result<()> {
        instructions::vote_neg(ctx)
    }
    // pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
    //     instructions::mint_nft(ctx)
    // }
}
#[derive(Debug, Clone)]
pub struct TokenMetaDataProgram;

impl anchor_lang::Id for TokenMetaDataProgram {
    fn id() -> Pubkey {
        mpl_token_metadata::id()
    }
}

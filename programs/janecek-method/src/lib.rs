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
        voting_timestamp: Option<u64>,
    ) -> Result<()> {
        instructions::initialize(ctx, voting_timestamp)
    }
    pub fn stop_voting(ctx: Context<UpdateVotingInfo>) -> Result<()> {
        instructions::stop_voting(ctx)
    }
    pub fn reset_voting(ctx: Context<UpdateVotingInfo>) -> Result<()> {
        instructions::reset_voting(ctx)
    }
    pub fn change_default_timestamp(
        ctx: Context<UpdateVotingInfo>,
        new_timestamp: u64,
    ) -> Result<()> {
        instructions::change_default_timestamp(ctx, new_timestamp)
    }
    pub fn start_registrations(ctx: Context<UpdateVotingInfo>) -> Result<()> {
        instructions::start_registrations(ctx)
    }
    pub fn start_voting(ctx: Context<UpdateVotingInfo>) -> Result<()> {
        instructions::start_voting(ctx)
    }
    pub fn add_party(ctx: Context<AddParty>, party_name: String) -> Result<()> {
        instructions::add_party(ctx, party_name)
    }
    pub fn create_voter(ctx: Context<CreateVoter>) -> Result<()> {
        instructions::create_voter(ctx)
    }
    pub fn vote_pos(ctx: Context<Vote>) -> Result<()> {
        instructions::vote_pos(ctx)
    }
    pub fn vote_neg(ctx: Context<Vote>) -> Result<()> {
        instructions::vote_neg(ctx)
    }
}

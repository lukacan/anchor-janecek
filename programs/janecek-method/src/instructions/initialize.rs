#![allow(clippy::result_large_err)]

use crate::states::*;
use anchor_lang::prelude::*;

pub fn initialize(ctx: Context<InitializeVoting>) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;

    voting_info.voting_authority = ctx.accounts.voting_authority.key();
    voting_info.emergency = false;
    voting_info.voting_timestamp = 7 * 24 * 60 * 60; // 7 days
    voting_info.voting_started = 0;
    voting_info.voting_state = VotingState::Initialized;
    voting_info.bump = *ctx.bumps.get("voting_info").unwrap();
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeVoting<'info> {
    #[account(mut)]
    pub voting_authority: Signer<'info>,
    #[account(
        init,
        payer = voting_authority,
        seeds = [VOTING_INFO_SEED,voting_authority.key().as_ref()],
        bump,
        space = VotingInfo::LEN,
    )]
    pub voting_info: Account<'info, VotingInfo>,
    pub system_program: Program<'info, System>,
}

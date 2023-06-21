#![allow(clippy::result_large_err)]

use crate::states::*;
use anchor_lang::prelude::*;

pub fn initialize(ctx: Context<InitializeVoting>, voting_timestamp: Option<u64>) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;

    voting_info.voting_authority = ctx.accounts.voting_authority.key();
    voting_info.emergency = false;
    match voting_timestamp {
        Some(timestamp) => {
            voting_info.voting_timestamp = timestamp;
        }
        None => {
            voting_info.voting_timestamp = DEFAULT_VOTING_TIMESTAMP;
        }
    }
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
        space = VotingInfo::LEN,
        seeds = [VOTING_INFO_SEED,voting_authority.key().as_ref()],
        bump,
    )]
    pub voting_info: Account<'info, VotingInfo>,
    pub system_program: Program<'info, System>,
}

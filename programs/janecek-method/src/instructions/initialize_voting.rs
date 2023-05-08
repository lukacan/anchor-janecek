#![allow(clippy::result_large_err)]

use crate::states::*;
use anchor_lang::prelude::*;

pub fn initialize_voting(ctx: Context<InitializeVoting>, voting_authority: Pubkey) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;

    voting_info.voting_authority = voting_authority;
    voting_info.emergency = false;
    voting_info.bump = *ctx.bumps.get("voting_info").unwrap();
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeVoting<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        seeds = [VOTING_INFO_SEED],
        bump,
        space = VotingInfo::LEN,
    )]
    pub voting_info: Account<'info, VotingInfo>,

    pub system_program: Program<'info, System>,
}

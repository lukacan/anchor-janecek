use anchor_lang::prelude::*;

use crate::states::*;

pub fn update_voting_info(
    ctx: Context<UpdateVotingInfo>,
    new_voting_authority: Pubkey,
) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;
    voting_info.voting_authority = new_voting_authority;
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateVotingInfo<'info> {
    pub voting_authority: Signer<'info>,
    #[account(
        mut,
        has_one = voting_authority,
        seeds = [VOTING_INFO_SEED],
        bump = voting_info.bump,
    )]
    pub voting_info: Account<'info, VotingInfo>,
}

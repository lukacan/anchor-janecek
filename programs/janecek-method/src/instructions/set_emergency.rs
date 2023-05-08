use anchor_lang::prelude::*;

use crate::states::*;

pub fn stop_voting(ctx: Context<SetEmergency>) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;
    voting_info.emergency = true;
    Ok(())
}

pub fn reset_voting(ctx: Context<SetEmergency>) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;
    voting_info.emergency = false;
    Ok(())
}

#[derive(Accounts)]
pub struct SetEmergency<'info> {
    pub voting_authority: Signer<'info>,
    #[account(
        mut,
        has_one=voting_authority,
        seeds=[VOTING_INFO_SEED],
        bump = voting_info.bump,
    )]
    pub voting_info: Account<'info, VotingInfo>,
}

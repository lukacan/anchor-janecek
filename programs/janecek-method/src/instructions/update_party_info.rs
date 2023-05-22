use crate::{error::VotingError, states::*};

use anchor_lang::prelude::*;

pub fn change_name(ctx: Context<UpdatePartyInfo>) -> Result<()> {
    require!(
        !ctx.accounts.voting_info.emergency,
        VotingError::VotingInEmergencyMode
    );
    require!(
        ctx.accounts.voting_info.voting_state == VotingState::Registrations,
        VotingError::VotingInWrongState
    );

    // change name here
    Ok(())
}

#[derive(Accounts)]
pub struct UpdatePartyInfo<'info> {
    /// CHECK: This may be good but doublecheck
    pub voting_authority: AccountInfo<'info>,
    pub party_creator: Signer<'info>,
    #[account(
        has_one = voting_authority,
        seeds=[VOTING_INFO_SEED,voting_authority.key().as_ref()],
        bump=voting_info.bump
    )]
    pub voting_info: Account<'info, VotingInfo>,
    #[account(
        has_one = party_creator,
        seeds=[PARTY_SEED,party_creator.key().as_ref(),voting_info.key().as_ref()],
        bump = party.bump,
    )]
    pub party: Account<'info, Party>,
}

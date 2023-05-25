use anchor_lang::prelude::*;

use crate::{error::VotingError, states::*};

pub fn stop_voting(ctx: Context<UpdateVotingInfo>) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;
    voting_info.emergency = true;
    Ok(())
}

pub fn reset_voting(ctx: Context<UpdateVotingInfo>) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;
    voting_info.emergency = false;
    Ok(())
}

pub fn change_default_timestamp(ctx: Context<UpdateVotingInfo>, new_timestamp: i64) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;
    require!(!voting_info.emergency, VotingError::VotingInEmergencyMode);
    require!(
        voting_info.voting_state == VotingState::Initialized,
        VotingError::NotInitialState
    );
    voting_info.voting_timestamp = new_timestamp;
    Ok(())
}
pub fn start_registrations(ctx: Context<UpdateVotingInfo>) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;
    require!(!voting_info.emergency, VotingError::VotingInEmergencyMode);
    require!(
        voting_info.voting_state == VotingState::Initialized,
        VotingError::NotInitialState
    );
    voting_info.voting_state = VotingState::Registrations;

    Ok(())
}

// TODO create function that will set isMutable to False on all parties
// this has to be done on frontend because of sealevel
pub fn start_voting(ctx: Context<UpdateVotingInfo>) -> Result<()> {
    let voting_info = &mut ctx.accounts.voting_info;

    require!(!voting_info.emergency, VotingError::VotingInEmergencyMode);
    require!(
        voting_info.voting_state == VotingState::Registrations,
        VotingError::StartRegistrationsFirst
    );

    let clock: Clock = Clock::get().unwrap();

    voting_info.voting_started = clock.unix_timestamp;
    voting_info.voting_ends = match voting_info
        .voting_started
        .checked_add(voting_info.voting_timestamp)
    {
        Some(x) => x,
        None => return Err(VotingError::AdditionOverflow.into()),
    };

    voting_info.voting_state = VotingState::Voting;

    Ok(())
}
// pub fn add_voting_authority(
//     ctx: Context<UpdateVotingInfo>,
//     new_voting_authority: Pubkey,
// ) -> Result<()> {
//     let voting_info = &mut ctx.accounts.voting_info;
//     require!(
//         voting_info.voting_state == VotingState::Initialized,
//         VotingError::VotingInWrongState
//     );
//     voting_info.voting_authority = new_voting_authority;
//     Ok(())
// }

#[derive(Accounts)]
pub struct UpdateVotingInfo<'info> {
    pub voting_authority: Signer<'info>,
    #[account(
        mut,
        has_one=voting_authority,
        seeds=[VOTING_INFO_SEED,voting_authority.key().as_ref()],
        bump = voting_info.bump,
    )]
    pub voting_info: Account<'info, VotingInfo>,
}

use anchor_lang::prelude::*;

use crate::{
    error::VotingError,
    states::{NumVotes, Voter, VotingInfo, VotingState, VOTER_SEED, VOTING_INFO_SEED},
};
#[access_control(can_create_voter(&ctx.accounts.voting_info))]
pub fn create_voter(ctx: Context<CreateVoter>) -> Result<()> {
    let voter_info = &mut ctx.accounts.voter;

    voter_info.voter_authority = ctx.accounts.voter_authority.key();
    voter_info.voting_info = ctx.accounts.voting_info.key();
    voter_info.num_votes = NumVotes::Three;
    voter_info.bump = *ctx.bumps.get("voter").unwrap();

    Ok(())
}
fn can_create_voter(voting_info: &VotingInfo) -> Result<()> {
    require!(!voting_info.emergency, VotingError::VotingInEmergencyMode);
    require!(
        voting_info.voting_state == VotingState::Registrations
            || voting_info.voting_state == VotingState::Voting,
        VotingError::VoterRegistrationsNotAllowed
    );
    Ok(())
}
#[derive(Accounts)]
pub struct CreateVoter<'info> {
    /// CHECK: By using UncheckedAccount, say explicitly that this account
    /// is not checked, but we check it in context of voting info
    pub voting_authority: UncheckedAccount<'info>,
    #[account(
        has_one=voting_authority,
        seeds=[VOTING_INFO_SEED,voting_authority.key().as_ref()],
        bump=voting_info.bump
    )]
    pub voting_info: Account<'info, VotingInfo>,
    #[account(mut)]
    pub voter_authority: Signer<'info>,
    #[account(
        init,
        payer = voter_authority,
        space = Voter::LEN,
        seeds = [VOTER_SEED,voter_authority.key().as_ref(),voting_info.key().as_ref()],
        bump
    )]
    pub voter: Account<'info, Voter>,
    pub system_program: Program<'info, System>,
}

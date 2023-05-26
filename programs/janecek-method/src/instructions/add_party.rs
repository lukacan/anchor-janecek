use crate::{error::VotingError, states::*};

use anchor_lang::prelude::*;

pub fn add_party(ctx: Context<AddParty>) -> Result<()> {
    require!(
        !ctx.accounts.voting_info.emergency,
        VotingError::VotingInEmergencyMode
    );
    require!(
        ctx.accounts.voting_info.voting_state == VotingState::Registrations,
        VotingError::PartyRegistrationsNotAllowed
    );

    let party = &mut ctx.accounts.party;

    party.party_creator = ctx.accounts.party_creator.key();
    party.voting_info = ctx.accounts.voting_info.key();
    party.have_nft = false;

    let clock: Clock = Clock::get().unwrap();
    party.created = clock.unix_timestamp;
    party.votes = 0;
    party.bump = *ctx.bumps.get("party").unwrap();

    Ok(())
}

#[derive(Accounts)]
pub struct AddParty<'info> {
    #[account(mut)]
    pub voting_authority: Signer<'info>,
    #[account(mut)]
    pub party_creator: Signer<'info>,
    #[account(
        has_one=voting_authority,
        seeds=[VOTING_INFO_SEED,voting_authority.key().as_ref()],
        bump=voting_info.bump
    )]
    pub voting_info: Account<'info, VotingInfo>,
    #[account(
        init,
        payer=party_creator,
        space=Party::LEN,
        seeds=[PARTY_SEED,party_creator.key().as_ref(),voting_info.key().as_ref()],
        bump,
    )]
    pub party: Account<'info, Party>,
    pub system_program: Program<'info, System>,
}

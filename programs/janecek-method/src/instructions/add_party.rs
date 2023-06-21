use crate::{error::VotingError, states::*};

use anchor_lang::prelude::*;

#[access_control(can_add_party(&ctx.accounts.voting_info))]
pub fn add_party(ctx: Context<AddParty>, party_name: String) -> Result<()> {
    require!(
        party_name.len() <= PARTY_NAME_LEN,
        VotingError::InvalidPartyName
    );
    let party = &mut ctx.accounts.party;

    let mut tmp_buffer: [u8; PARTY_NAME_LEN] = [0; PARTY_NAME_LEN];
    tmp_buffer[..party_name.len()].copy_from_slice(party_name.as_bytes());
    party.name = tmp_buffer;
    party.party_creator = ctx.accounts.party_creator.key();
    party.voting_info = ctx.accounts.voting_info.key();

    let clock: Clock = Clock::get().unwrap();
    party.created = u64::try_from(clock.unix_timestamp).unwrap();
    party.votes = 0;
    party.bump = *ctx.bumps.get("party").unwrap();

    Ok(())
}
fn can_add_party(voting_info: &VotingInfo) -> Result<()> {
    require!(!voting_info.emergency, VotingError::VotingInEmergencyMode);
    require!(
        voting_info.voting_state == VotingState::Registrations,
        VotingError::PartyRegistrationsNotAllowed
    );
    Ok(())
}

#[derive(Accounts)]
pub struct AddParty<'info> {
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

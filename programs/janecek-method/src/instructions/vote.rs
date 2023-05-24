use anchor_lang::prelude::*;

use crate::{
    error::VotingError,
    states::{
        NumVotes, Party, Voter, VotingInfo, VotingState, PARTY_SEED, VOTER_SEED, VOTING_INFO_SEED,
    },
};

pub fn vote_pos(ctx: Context<Vote>) -> Result<()> {
    require!(
        !ctx.accounts.voting_info.emergency,
        VotingError::VotingInEmergencyMode
    );
    require!(
        ctx.accounts.voting_info.voting_state == VotingState::Voting,
        VotingError::VotingNotAllowed
    );

    let voter = &mut ctx.accounts.voter;

    match voter.num_votes {
        NumVotes::Three => {
            let party = &mut ctx.accounts.party;

            party.votes = match party.votes.checked_add(1) {
                Some(value) => value,
                None => return Err(VotingError::AdditionOverflow.into()),
            };

            voter.pos1 = party.key();
            voter.num_votes = NumVotes::Two;
            Ok(())
        }
        NumVotes::Two => {
            let party = &mut ctx.accounts.party;
            require!(voter.pos1 != party.key(), VotingError::NoBothPositiveToSame);

            party.votes = match party.votes.checked_add(1) {
                Some(value) => value,
                None => return Err(VotingError::AdditionOverflow.into()),
            };

            voter.pos2 = party.key();
            voter.num_votes = NumVotes::One;

            Ok(())
        }
        NumVotes::One => Err(VotingError::NoMorePosVotes.into()),
        NumVotes::Zero => Err(VotingError::NoMoreVotes.into()),
    }
}

pub fn vote_neg(ctx: Context<Vote>) -> Result<()> {
    require!(
        !ctx.accounts.voting_info.emergency,
        VotingError::VotingInEmergencyMode
    );
    require!(
        ctx.accounts.voting_info.voting_state == VotingState::Voting,
        VotingError::VotingNotAllowed
    );

    let voter = &mut ctx.accounts.voter;

    match voter.num_votes {
        NumVotes::Three => Err(VotingError::VoteTwoPosFirst.into()),
        NumVotes::Two => Err(VotingError::VoteTwoPosFirst.into()),
        NumVotes::One => {
            let party = &mut ctx.accounts.party;

            party.votes = match party.votes.checked_sub(1) {
                Some(value) => value,
                None => return Err(VotingError::SubtractionUnderflow.into()),
            };

            voter.neg1 = party.key();
            voter.num_votes = NumVotes::Zero;

            Ok(())
        }
        NumVotes::Zero => Err(VotingError::NoMoreVotes.into()),
    }
}

#[derive(Accounts)]
pub struct Vote<'info> {
    /// CHECK: This may be good but doublecheck
    pub voting_authority: AccountInfo<'info>,
    #[account(
        has_one=voting_authority,
        seeds=[VOTING_INFO_SEED,voting_authority.key().as_ref()],
        bump=voting_info.bump
    )]
    pub voting_info: Account<'info, VotingInfo>,
    /// CHECK: This may be good but doublecheck
    pub party_creator: AccountInfo<'info>,
    #[account(
        mut,
        has_one = party_creator,
        has_one = voting_info,
        seeds=[PARTY_SEED,party_creator.key().as_ref(),voting_info.key().as_ref()],
        bump = party.bump,
    )]
    pub party: Account<'info, Party>,
    pub voter_authority: Signer<'info>,
    #[account(
        mut,
        has_one = voter_authority,
        has_one = voting_info,
        seeds = [VOTER_SEED,voter_authority.key().as_ref(),voting_info.key().as_ref()],
        bump = voter.bump
    )]
    pub voter: Account<'info, Voter>,
}

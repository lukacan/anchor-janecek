use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, mint_to, Mint, Token, TokenAccount},
};
use mpl_token_metadata::instruction::mint_new_edition_from_master_edition_via_token;
use solana_program::program::invoke;

use crate::{
    error::VotingError,
    states::{
        NumVotes, Party, Voter, VotingInfo, VotingState, PARTY_SEED, VOTER_SEED, VOTING_INFO_SEED,
    },
    TokenMetaDataProgram,
};

pub fn vote_pos_nft(ctx: Context<VoteNFT>) -> Result<()> {
    require!(
        !ctx.accounts.voting_info.emergency,
        VotingError::VotingInEmergencyMode
    );
    require!(
        ctx.accounts.voting_info.voting_state == VotingState::Voting,
        VotingError::VotingNotAllowed
    );

    require!(
        ctx.accounts.party.have_nft,
        VotingError::PartyDoesNotProvideNFT
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

            mint_to(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    token::MintTo {
                        mint: ctx.accounts.voter_mint.to_account_info(),
                        to: ctx.accounts.voter_token_account.to_account_info(),
                        authority: ctx.accounts.party_creator.to_account_info(),
                    },
                ),
                1,
            )?;

            // invoke(
            //     &mint_new_edition_from_master_edition_via_token(
            //         ctx.accounts.token_metadata_program.key(),
            //         ctx.accounts.new_metadata_account.key(),
            //         ctx.accounts.new_edition_account.key(),
            //         ctx.accounts.master_edition_account.key(),
            //         ctx.accounts.new_mint.key(),
            //         ctx.accounts.voting_authority.key(),
            //         ctx.accounts.party_creator.key(),
            //         ctx.accounts.voting_authority.key(),
            //         ctx.accounts.token_account.key(),
            //         ctx.accounts.voting_authority.key(),
            //         ctx.accounts.metadata_account.key(),
            //         ctx.accounts.mint.key(),
            //         1,
            //     ),
            //     &[
            //         ctx.accounts.new_metadata_account.to_account_info(),
            //         ctx.accounts.new_edition_account.to_account_info(),
            //         ctx.accounts.master_edition_account.to_account_info(),
            //         ctx.accounts.new_mint.to_account_info(),
            //         ctx.accounts.edition_mark_pda.to_account_info(),
            //         ctx.accounts.voting_authority.to_account_info(),
            //         ctx.accounts.party_creator.to_account_info(),
            //         ctx.accounts.voting_authority.to_account_info(),
            //         ctx.accounts.token_account.to_account_info(),
            //         ctx.accounts.voting_authority.to_account_info(),
            //         ctx.accounts.metadata_account.to_account_info(),
            //         ctx.accounts.token_program.to_account_info(),
            //         ctx.accounts.system_program.to_account_info(),
            //         ctx.accounts.rent.to_account_info(),
            //     ],
            // )?;

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

#[derive(Accounts)]
pub struct VoteNFT<'info> {
    /// CHECK: This may be good but doublecheck
    pub voting_authority: AccountInfo<'info>,
    #[account(
        has_one=voting_authority,
        seeds=[VOTING_INFO_SEED,voting_authority.key().as_ref()],
        bump=voting_info.bump
    )]
    pub voting_info: Box<Account<'info, VotingInfo>>,
    /// CHECK: This may be good but doublecheck
    pub party_creator: AccountInfo<'info>,
    #[account(
        mut,
        has_one = party_creator,
        has_one = voting_info,
        seeds=[PARTY_SEED,party_creator.key().as_ref(),voting_info.key().as_ref()],
        bump = party.bump,
    )]
    pub party: Box<Account<'info, Party>>,
    #[account(mut)]
    pub voter_authority: Signer<'info>,
    #[account(
        mut,
        has_one = voter_authority,
        has_one = voting_info,
        seeds = [VOTER_SEED,voter_authority.key().as_ref(),voting_info.key().as_ref()],
        bump = voter.bump
    )]
    pub voter: Box<Account<'info, Voter>>,
    #[account(
        init,
        payer = voter_authority,
        mint::authority = voter_authority,
        mint::freeze_authority = voter_authority,
        mint::decimals = 0,
    )]
    pub voter_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = voter_authority,
        associated_token::mint = voter_mint,
        associated_token::authority = voter_authority,
    )]
    pub voter_token_account: Account<'info, TokenAccount>,

    /// CHECK: We are about to create this and Metaplex will check if address is correct
    /// https://github.com/metaplex-foundation/metaplex-program-library/blob/dfd95f7b67d5621d7303e2cb4b678e86904f98a7/token-metadata/program/src/utils/master_edition.rs#L401
    /// https://github.com/metaplex-foundation/metaplex-program-library/blob/dfd95f7b67d5621d7303e2cb4b678e86904f98a7/token-metadata/program/src/utils/metadata.rs#L102
    #[account(mut)]
    pub voter_metadata_account: AccountInfo<'info>,

    /// CHECK: We are about to create this and Metaplex will check if address is correct
    /// https://github.com/metaplex-foundation/metaplex-program-library/blob/dfd95f7b67d5621d7303e2cb4b678e86904f98a7/token-metadata/program/src/utils/master_edition.rs#L366
    #[account(mut)]
    pub voter_edition_account: AccountInfo<'info>,

    /// CHECK: We are not creating , but metaplex check correctness -- consider addint these few pubkeys to party acc, and compare with em, mint, token , metadata, master
    /// https://github.com/metaplex-foundation/metaplex-program-library/blob/ae436e9734977773654fb8ea0f72e3ac559253b8/token-metadata/program/src/utils/metadata.rs#LL102C38-L102C51
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,

    /// CHECK: We are not creating , but metaplex check correctness
    /// https://github.com/metaplex-foundation/metaplex-program-library/blob/ae436e9734977773654fb8ea0f72e3ac559253b8/token-metadata/program/src/processor/edition/create_master_edition_v3.rs#L43
    #[account(mut)]
    pub master_edition_account: AccountInfo<'info>,

    pub token_metadata_program: Program<'info, TokenMetaDataProgram>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

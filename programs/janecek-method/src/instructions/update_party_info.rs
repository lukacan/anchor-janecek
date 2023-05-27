use crate::{error::VotingError, states::*, TokenMetaDataProgram};

use anchor_lang::prelude::*;
use mpl_token_metadata::{
    instruction::{sign_metadata, update_metadata_accounts_v2},
    state::DataV2,
};

use solana_program::program::invoke_signed;

// https://github.com/metaplex-foundation/metaplex-program-library/blob/dfd95f7b67d5621d7303e2cb4b678e86904f98a7/token-metadata/program/src/processor/metadata/update_metadata_account_v2.rs#L20
pub fn change_nft_data(
    ctx: Context<UpdatePartyInfo>,
    input_name: String,
    input_symbol: String,
    input_uri: String,
    is_mutable: bool,
) -> Result<()> {
    require!(
        ctx.accounts.party.have_nft,
        VotingError::PartyDoesNotProvideNFT
    );
    require!(
        !ctx.accounts.voting_info.emergency,
        VotingError::VotingInEmergencyMode
    );
    require!(
        ctx.accounts.voting_info.voting_state == VotingState::Registrations,
        VotingError::PartyRegistrationsNotAllowed
    );

    // I dont like this but it seems that there is no other way
    let creator = vec![mpl_token_metadata::state::Creator {
        address: ctx.accounts.party.key(),
        verified: false,
        share: 100,
    }];

    let new_data: DataV2 = DataV2 {
        name: input_name,
        symbol: input_symbol,
        uri: input_uri,
        seller_fee_basis_points: 0,
        creators: Some(creator),
        collection: None,
        uses: None,
    };

    let party_bump = ctx.accounts.party.bump;
    invoke_signed(
        &update_metadata_accounts_v2(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.master_metadata.key(),
            ctx.accounts.party.key(),
            None,
            Some(new_data),
            Some(false),
            Some(is_mutable),
        ),
        &[
            ctx.accounts.master_metadata.to_account_info(),
            ctx.accounts.party.to_account_info(),
        ],
        &[&[
            PARTY_SEED,
            ctx.accounts.party_creator.key().as_ref(),
            ctx.accounts.voting_info.key().as_ref(),
            &[party_bump],
        ]],
    )?;
    invoke_signed(
        &sign_metadata(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.master_metadata.key(),
            ctx.accounts.party.key(),
        ),
        &[
            ctx.accounts.master_metadata.to_account_info(),
            ctx.accounts.party.to_account_info(),
        ],
        &[&[
            PARTY_SEED,
            ctx.accounts.party_creator.key().as_ref(),
            ctx.accounts.voting_info.key().as_ref(),
            &[party_bump],
        ]],
    )?;
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
        has_one = voting_info,
        has_one = master_metadata,
        seeds=[PARTY_SEED,party_creator.key().as_ref(),voting_info.key().as_ref()],
        bump = party.bump,
    )]
    pub party: Account<'info, Party>,
    /// CHECK: Find if metaplex checks this
    #[account(mut)]
    pub master_metadata: AccountInfo<'info>,

    pub token_metadata_program: Program<'info, TokenMetaDataProgram>,
}

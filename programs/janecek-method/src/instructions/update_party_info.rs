use crate::{error::VotingError, states::*, TokenMetaDataProgram};

use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use mpl_token_metadata::{
    instruction::{
        builders::{UpdateBuilder, VerifyBuilder},
        InstructionBuilder, UpdateArgs, VerificationArgs,
    },
    state::Data,
};
use solana_program::program::invoke_signed;
/// https://github.com/metaplex-foundation/metaplex-program-library/blob/dfd95f7b67d5621d7303e2cb4b678e86904f98a7/token-metadata/program/src/processor/metadata/update.rs#L52
/// using new API
pub fn change_nft_data(
    ctx: Context<UpdatePartyInfo>,
    input_name: String,
    input_symbol: String,
    input_uri: String,
    is_mutable: Option<bool>,
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
    require!(
        solana_program::sysvar::instructions::check_id(&ctx.accounts.instructions.key()),
        VotingError::SysvarInstructionsMismatch
    );
    let party_bump = ctx.accounts.party.bump;

    let creator = vec![mpl_token_metadata::state::Creator {
        address: ctx.accounts.party.key(),
        verified: false,
        share: 100,
    }];

    invoke_signed(
        &UpdateBuilder::new()
            .authority(ctx.accounts.party.key())
            .metadata(ctx.accounts.master_metadata.key())
            .mint(ctx.accounts.master_mint.key())
            .payer(ctx.accounts.party_creator.key())
            .build(UpdateArgs::AsUpdateAuthorityV2 {
                new_update_authority: None,
                data: Some(Data {
                    name: input_name,
                    symbol: input_symbol,
                    uri: input_uri,
                    seller_fee_basis_points: 0,
                    creators: Some(creator),
                }),
                primary_sale_happened: None,
                is_mutable,
                collection: Default::default(),
                collection_details: Default::default(),
                uses: Default::default(),
                rule_set: Default::default(),
                token_standard: None,
                authorization_data: None,
            })
            .unwrap()
            .instruction(),
        &[
            ctx.accounts.master_mint.to_account_info(),
            ctx.accounts.party_creator.to_account_info(),
            ctx.accounts.master_metadata.to_account_info(),
            ctx.accounts.party.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.instructions.to_account_info(),
        ],
        &[&[
            PARTY_SEED,
            ctx.accounts.party_creator.key().as_ref(),
            ctx.accounts.voting_info.key().as_ref(),
            &[party_bump],
        ]],
    )?;

    invoke_signed(
        &VerifyBuilder::new()
            .authority(ctx.accounts.party.key())
            .metadata(ctx.accounts.master_metadata.key())
            .build(VerificationArgs::CreatorV1)
            .unwrap()
            .instruction(),
        &[
            ctx.accounts.master_metadata.to_account_info(),
            ctx.accounts.party.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.instructions.to_account_info(),
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
    pub voting_authority: UncheckedAccount<'info>,
    #[account(mut)]
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
        has_one = master_edition,
        has_one = master_mint,
        seeds=[PARTY_SEED,party_creator.key().as_ref(),voting_info.key().as_ref()],
        bump = party.bump,
    )]
    pub party: Account<'info, Party>,
    #[account(
        mint::authority = master_edition,
        mint::freeze_authority = master_edition,
        mint::decimals = 0,
    )]
    pub master_mint: Account<'info, Mint>,
    /// CHECK: This is used only in mint/freeze authority check
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,
    /// CHECK: This is checked by Metaplex and we check it with what is stored in party
    #[account(mut)]
    pub master_metadata: AccountInfo<'info>,
    pub token_metadata_program: Program<'info, TokenMetaDataProgram>,
    pub system_program: Program<'info, System>,
    /// CHECK: we can`t check this with anchor, so we will check manually in code (33)
    pub instructions: UncheckedAccount<'info>,
}

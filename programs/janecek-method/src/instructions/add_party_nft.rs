use crate::{error::VotingError, states::*, TokenMetaDataProgram};

use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use mpl_token_metadata::{
    instruction::{
        builders::{CreateBuilder, MintBuilder, VerifyBuilder},
        CreateArgs, InstructionBuilder, MintArgs, VerificationArgs,
    },
    state::{
        AssetData, PrintSupply, TokenStandard, MAX_NAME_LENGTH, MAX_SYMBOL_LENGTH, MAX_URI_LENGTH,
    },
    utils::puffed_out_string,
};
pub fn add_party_nft(
    ctx: Context<AddPartyNFT>,
    input_name: String,
    input_symbol: String,
    input_uri: String,
    max_supply: Option<u64>,
) -> Result<()> {
    require!(
        !ctx.accounts.voting_info.emergency,
        VotingError::VotingInEmergencyMode
    );
    // parties can be added only in initial state, so it`s up to voting authority
    // to decide when start voting
    // we can argue that people can create parties, pay for everything and then voting
    // will not start, and people will lose money basically. In order to prevent this,
    // voting authority have to sign party creation, and will pay for
    // creating NFT metadatas
    require!(
        ctx.accounts.voting_info.voting_state == VotingState::Registrations,
        VotingError::PartyRegistrationsNotAllowed
    );
    require!(
        solana_program::sysvar::instructions::check_id(&ctx.accounts.instructions.key()),
        VotingError::SysvarInstructionsMismatch
    );

    let print_supply = match max_supply {
        Some(0) => PrintSupply::Zero,
        Some(x) => PrintSupply::Limited(x),
        None => PrintSupply::Unlimited,
    };
    let creator = vec![mpl_token_metadata::state::Creator {
        address: ctx.accounts.party.key(),
        verified: false,
        share: 100,
    }];
    let party_bump = *ctx.bumps.get("party").unwrap();

    let name = puffed_out_string(&input_name, MAX_NAME_LENGTH);
    let symbol = puffed_out_string(&input_symbol, MAX_SYMBOL_LENGTH);
    let uri = puffed_out_string(&input_uri, MAX_URI_LENGTH);

    let mut asset = AssetData::new(TokenStandard::ProgrammableNonFungible, name, symbol, uri);
    asset.seller_fee_basis_points = 0;
    asset.creators = Some(creator);

    msg!("here {}", ctx.accounts.mint.key());
    invoke_signed(
        &CreateBuilder::new()
            .metadata(ctx.accounts.metadata_account.key())
            .master_edition(ctx.accounts.master_edition_account.key())
            .mint(ctx.accounts.mint.key())
            .authority(ctx.accounts.party_creator.key())
            .payer(ctx.accounts.voting_authority.key())
            .update_authority(ctx.accounts.party.key())
            .initialize_mint(false)
            .update_authority_as_signer(true)
            .build(CreateArgs::V1 {
                asset_data: asset,
                decimals: Some(0),
                print_supply: Some(print_supply),
            })
            .unwrap()
            .instruction(),
        &[
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.master_edition_account.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.party_creator.to_account_info(),
            ctx.accounts.party.to_account_info(),
            ctx.accounts.instructions.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
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
            .metadata(ctx.accounts.metadata_account.key())
            .build(VerificationArgs::CreatorV1)
            .unwrap()
            .instruction(),
        &[
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.party.to_account_info(),
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
        &MintBuilder::new()
            .token(ctx.accounts.master_token_account.key())
            .metadata(ctx.accounts.metadata_account.key())
            .master_edition(ctx.accounts.master_edition_account.key())
            .token_record(ctx.accounts.master_token_record.key())
            .mint(ctx.accounts.mint.key())
            .authority(ctx.accounts.party.key())
            .payer(ctx.accounts.voting_authority.key())
            .build(MintArgs::V1 {
                amount: 1,
                authorization_data: None,
            })
            .unwrap()
            .instruction(),
        &[
            ctx.accounts.master_token_record.to_account_info(),
            ctx.accounts.master_edition_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.master_token_account.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.party.to_account_info(),
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.instructions.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.associated_token_program.to_account_info(),
        ],
        &[&[
            PARTY_SEED,
            ctx.accounts.party_creator.key().as_ref(),
            ctx.accounts.voting_info.key().as_ref(),
            &[party_bump],
        ]],
    )?;

    let party = &mut ctx.accounts.party;

    party.party_creator = ctx.accounts.party_creator.key();
    party.voting_info = ctx.accounts.voting_info.key();
    party.have_nft = true;
    party.master_mint = ctx.accounts.mint.key();
    // TODO We probably dont need this as we are not minting , creating only
    //party.master_token = ctx.accounts.token_account.key();
    party.master_metadata = ctx.accounts.metadata_account.key();
    party.master_edition = ctx.accounts.master_edition_account.key();

    let clock: Clock = Clock::get().unwrap();
    party.created = clock.unix_timestamp;
    party.votes = 0;
    party.bump = *ctx.bumps.get("party").unwrap();

    Ok(())
}

#[derive(Accounts)]
pub struct AddPartyNFT<'info> {
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
    // TODO This is OK
    // Only owner can change data, so that lamports cannot be changed as we do not own this
    // SPL trasnfer is also not possible
    #[account(
        init,
        payer = party_creator,
        mint::authority = party_creator,
        mint::freeze_authority = party_creator,
        mint::decimals = 0,
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = party_creator,
        associated_token::mint = mint,
        associated_token::authority = party,
    )]
    pub master_token_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: We are about to create this, metaplex check correctness
    /// https://github.com/metaplex-foundation/metaplex-program-library/blob/e4df367c29109fde2ca824b3cb40fc257b0e6329/token-metadata/program/src/processor/metadata/mint.rs#L177
    #[account(mut)]
    pub master_token_record: UncheckedAccount<'info>,
    /// CHECK: We are about to create this and Metaplex will check if address is correct
    /// https://github.com/metaplex-foundation/metaplex-program-library/blob/ae436e9734977773654fb8ea0f72e3ac559253b8/token-metadata/program/src/utils/metadata.rs#LL102C38-L102C51
    #[account(mut)]
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: We are about to create this and Metaplex will check if address is correct
    /// https://github.com/metaplex-foundation/metaplex-program-library/blob/ae436e9734977773654fb8ea0f72e3ac559253b8/token-metadata/program/src/processor/edition/create_master_edition_v3.rs#L43
    #[account(mut)]
    pub master_edition_account: UncheckedAccount<'info>,

    pub token_metadata_program: Program<'info, TokenMetaDataProgram>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: we can`t check this with anchor, so we will check manually in code
    pub instructions: UncheckedAccount<'info>,
}

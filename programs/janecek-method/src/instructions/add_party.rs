use crate::{error::VotingError, states::*, TokenMetaDataProgram};

use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, mint_to, Mint, Token, TokenAccount},
};
use mpl_token_metadata::instruction::{
    create_master_edition_v3, create_metadata_accounts_v3, sign_metadata,
};
use solana_program::program::invoke;
pub fn add_party(ctx: Context<AddParty>, name: String, symbol: String, uri: String) -> Result<()> {
    // check if in emergency when everywhing halted
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

    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.party_creator.to_account_info(),
            },
        ),
        1,
    )?;

    let party_bump = *ctx.bumps.get("party").unwrap();

    let creator = vec![mpl_token_metadata::state::Creator {
        address: ctx.accounts.party.key(),
        verified: false,
        share: 100,
    }];

    // create metadata account
    invoke_signed(
        &create_metadata_accounts_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata_account.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.party_creator.key(),
            ctx.accounts.voting_authority.key(),
            ctx.accounts.party.key(),
            name,
            symbol,
            uri,
            Some(creator),
            1,
            true,
            true,
            None,
            None,
            None,
        ),
        &[
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.party_creator.to_account_info(),
            ctx.accounts.party.to_account_info(),
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

    // sign with creator
    invoke_signed(
        &sign_metadata(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata_account.key(),
            ctx.accounts.party.key(),
        ),
        &[
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.party.to_account_info(),
        ],
        &[&[
            PARTY_SEED,
            ctx.accounts.party_creator.key().as_ref(),
            ctx.accounts.voting_info.key().as_ref(),
            &[party_bump],
        ]],
    )?;

    // create master edition
    invoke_signed(
        &create_master_edition_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.master_edition_account.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.party.key(),
            ctx.accounts.party_creator.key(),
            ctx.accounts.metadata_account.key(),
            ctx.accounts.voting_authority.key(),
            Some(10),
        ),
        &[
            ctx.accounts.master_edition_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.party_creator.to_account_info(),
            ctx.accounts.party.to_account_info(),
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
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

    let party = &mut ctx.accounts.party;

    party.party_creator = ctx.accounts.party_creator.key();
    party.voting_info = ctx.accounts.voting_info.key();

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
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: We are about to create this and Metaplex will check if address is correct
    /// https://github.com/metaplex-foundation/metaplex-program-library/blob/ae436e9734977773654fb8ea0f72e3ac559253b8/token-metadata/program/src/utils/metadata.rs#LL102C38-L102C51
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,

    /// CHECK: We are about to create this and Metaplex will check if address is correct
    /// https://github.com/metaplex-foundation/metaplex-program-library/blob/ae436e9734977773654fb8ea0f72e3ac559253b8/token-metadata/program/src/processor/edition/create_master_edition_v3.rs#L43
    #[account(mut)]
    pub master_edition_account: AccountInfo<'info>,

    pub token_metadata_program: Program<'info, TokenMetaDataProgram>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

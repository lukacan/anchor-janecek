use crate::states::*;
use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
use mpl_token_metadata::instruction::{
    create_master_edition_v3, create_metadata_accounts_v3, sign_metadata,
};
use solana_program::program::invoke;

pub fn add_party(ctx: Context<AddParty>) -> Result<()> {
    let party_bump = *ctx.bumps.get("party").unwrap();

    let voting_info = &ctx.accounts.voting_info;

    let creator = vec![mpl_token_metadata::state::Creator {
        address: ctx.accounts.party.key(),
        verified: false,
        share: 100,
    }];

    // create metadata account
    invoke(
        &create_metadata_accounts_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata_account.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.voting_authority.key(),
            ctx.accounts.party_creator.key(),
            ctx.accounts.voting_authority.key(),
            std::string::ToString::to_string("Andrej"),
            std::string::ToString::to_string("Symbol"),
            std::string::ToString::to_string("Uri"),
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
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.party_creator.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
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
        &[&[PARTY_SEED, voting_info.key().as_ref(), &[party_bump]]],
    )?;

    // create master edition
    invoke(
        &create_master_edition_v3(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.master_edition_account.key(),
            ctx.accounts.mint.key(),
            ctx.accounts.voting_authority.key(),
            ctx.accounts.voting_authority.key(),
            ctx.accounts.metadata_account.key(),
            ctx.accounts.party_creator.key(),
            Some(10),
        ),
        &[
            ctx.accounts.master_edition_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.party_creator.to_account_info(),
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
    )?;

    // invoke_signed(
    //     &mint_new_edition_from_master_edition_via_token(
    //         ctx.accounts.token_metadata_program.key(),
    //         ctx.accounts.new_metadata_account.key(),
    //         ctx.accounts.new_edition_account.key(),
    //         ctx.accounts.master_edition_account.key(),
    //         ctx.accounts.new_mint.key(),
    //         ctx.accounts.voting_info.key(),
    //         ctx.accounts.party_creator.key(),
    //         ctx.accounts.voting_info.key(),
    //         ctx.accounts.token_account.key(),
    //         ctx.accounts.voting_info.key(),
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
    //         ctx.accounts.voting_info.to_account_info(),
    //         ctx.accounts.party_creator.to_account_info(),
    //         ctx.accounts.voting_info.to_account_info(),
    //         ctx.accounts.token_account.to_account_info(),
    //         ctx.accounts.voting_info.to_account_info(),
    //         ctx.accounts.metadata_account.to_account_info(),
    //         ctx.accounts.token_program.to_account_info(),
    //         ctx.accounts.system_program.to_account_info(),
    //         ctx.accounts.rent.to_account_info(),
    //     ],
    //     &[&[VOTING_INFO_SEED, &[voting_info.bump]]],
    // )?;

    let party = &mut ctx.accounts.party;

    party.party_owner = ctx.accounts.party_creator.key();
    party.bump = *ctx.bumps.get("party").unwrap();

    Ok(())
}

#[derive(Accounts)]
pub struct AddParty<'info> {
    pub voting_authority: Signer<'info>,
    #[account(mut)]
    pub party_creator: Signer<'info>,
    #[account(
        has_one=voting_authority,
        seeds=[VOTING_INFO_SEED],
        bump=voting_info.bump
    )]
    pub voting_info: Account<'info, VotingInfo>,
    #[account(
        init,
        payer=party_creator,
        space=Party::LEN,
        seeds=[PARTY_SEED,voting_info.key().as_ref()],
        bump,
    )]
    pub party: Account<'info, Party>,
    #[account(
        mut,
        mint::authority = voting_authority,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        associated_token::mint = mint,
        associated_token::authority = voting_authority,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,

    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub master_edition_account: AccountInfo<'info>,

    /// CHECK: Metaplex will check this
    pub token_metadata_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

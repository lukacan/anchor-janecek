use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::instruction::mint_new_edition_from_master_edition_via_token;
use mpl_token_metadata::instruction::update_primary_sale_happened_via_token;
use solana_program::program::invoke;

pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
    invoke(
        &mint_new_edition_from_master_edition_via_token(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.new_metadata_account.key(),
            ctx.accounts.new_edition_account.key(),
            ctx.accounts.master_edition_account.key(),
            ctx.accounts.new_mint.key(),
            ctx.accounts.voting_authority.key(),
            ctx.accounts.party_creator.key(),
            ctx.accounts.voting_authority.key(),
            ctx.accounts.token_account.key(),
            ctx.accounts.voting_authority.key(),
            ctx.accounts.metadata_account.key(),
            ctx.accounts.mint.key(),
            1,
        ),
        &[
            ctx.accounts.new_metadata_account.to_account_info(),
            ctx.accounts.new_edition_account.to_account_info(),
            ctx.accounts.master_edition_account.to_account_info(),
            ctx.accounts.new_mint.to_account_info(),
            ctx.accounts.edition_mark_pda.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.party_creator.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
    )?;

    invoke(
        &update_primary_sale_happened_via_token(
            ctx.accounts.token_metadata_program.key(),
            ctx.accounts.metadata_account.key(),
            ctx.accounts.voting_authority.key(),
            ctx.accounts.token_account.key(),
        ),
        &[
            ctx.accounts.metadata_account.to_account_info(),
            ctx.accounts.voting_authority.to_account_info(),
            ctx.accounts.token_account.to_account_info(),
        ],
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct MintNFT<'info> {
    pub voting_authority: Signer<'info>,
    #[account(mut)]
    pub party_creator: Signer<'info>,
    // this has set authority from create master edition
    pub mint: Account<'info, Mint>,
    // this authority is not set yet
    #[account(
        mut,
        mint::authority = voting_authority,
    )]
    pub new_mint: Account<'info, Mint>,
    #[account(
        associated_token::mint = mint,
        associated_token::authority = voting_authority,
    )]
    pub token_account: Account<'info, TokenAccount>,
    #[account(
        associated_token::mint = new_mint,
        associated_token::authority = voting_authority,
    )]
    pub new_token_account: Account<'info, TokenAccount>,

    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,

    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub master_edition_account: AccountInfo<'info>,

    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub new_metadata_account: AccountInfo<'info>,

    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub new_edition_account: AccountInfo<'info>,

    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub edition_mark_pda: AccountInfo<'info>,

    /// CHECK: Metaplex will check this
    pub token_metadata_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

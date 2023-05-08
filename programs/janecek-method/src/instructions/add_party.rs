use crate::states::*;
use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use mpl_token_metadata::instruction::{create_master_edition_v3, create_metadata_accounts_v3};

pub fn add_party(ctx: Context<AddParty>) -> Result<()> {
    let mintto_ctx = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.voting_info.to_account_info(),
    };
    let token_program_account = ctx.accounts.token_program.to_account_info();

    let voting_info = &ctx.accounts.voting_info;

    let seeds = &[VOTING_INFO_SEED, &[voting_info.bump]];
    let binding = [&seeds[..]];
    let mint_context = CpiContext::new(token_program_account, mintto_ctx).with_signer(&binding);

    mint_to(mint_context, 1)?;

    let title = std::string::ToString::to_string("Andrej");
    let symbol = std::string::ToString::to_string("symbol");
    let uri = std::string::ToString::to_string("uri");

    let creator = vec![mpl_token_metadata::state::Creator {
        address: ctx.accounts.party.key(),
        verified: true,
        share: 100,
    }];

    let account_info = vec![
        ctx.accounts.metadata_account.to_account_info(),
        ctx.accounts.mint.to_account_info(),
        ctx.accounts.voting_info.to_account_info(),
        ctx.accounts.party_creator.to_account_info(),
        ctx.accounts.voting_info.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
    ];

    let instr = create_metadata_accounts_v3(
        ctx.accounts.token_metadata_program.key(),
        ctx.accounts.metadata_account.key(),
        ctx.accounts.mint.key(),
        ctx.accounts.voting_info.key(),
        ctx.accounts.party_creator.key(),
        ctx.accounts.voting_info.key(),
        title,
        symbol,
        uri,
        Some(creator),
        1,
        true,
        false,
        None,
        None,
        None,
    );

    invoke_signed(&instr, &account_info, &binding)?;

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
        mint::authority = voting_info,
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = party_creator,
        associated_token::mint = mint,
        associated_token::authority = voting_info,
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,

    /// CHECK: we dpnt have to
    pub token_metadata_program: AccountInfo<'info>,

    /// CHECK: we dpnt have to
    #[account(mut)]
    pub metadata_account: AccountInfo<'info>,

    /// CHECK: we dpnt have to
    pub rent: AccountInfo<'info>,
}

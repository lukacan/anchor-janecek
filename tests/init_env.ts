import * as anchor from "@project-serum/anchor";
import { TestEnviroment } from "./env";
import { PublicKey } from '@solana/web3.js';
import { JanecekMethod } from "../target/types/janecek_method";
import * as token from '@solana/spl-token';
import { Metaplex, findMetadataPda } from "@metaplex-foundation/js";
import { toBigNumber } from "@metaplex-foundation/js";

export const VOTING_INFO_SEED = "janecek-voting-seed";
export const PARTY_SEED = "janecek-party-seed";
export const VOTER_SEED = "janecek-voter-seed";

export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export async function init_env(test_env: TestEnviroment) {
    test_env.provider = anchor.AnchorProvider.env();
    anchor.setProvider(test_env.provider);
    test_env.program = anchor.workspace.JanecekMethod as anchor.Program<JanecekMethod>;

    await airdrop(test_env.provider.connection, test_env.payer.publicKey);
    await airdrop(test_env.provider.connection, test_env.VotingAuthority.publicKey);
    await airdrop(test_env.provider.connection, test_env.NewVotingAuthority.publicKey);
    await airdrop(test_env.provider.connection, test_env.PartyCreator.publicKey);
    await airdrop(test_env.provider.connection, test_env.PartyCreator.publicKey);
    await airdrop(test_env.provider.connection, test_env.anotherPartyCreator.publicKey);
    await airdrop(test_env.provider.connection, test_env.anotherPartyCreator.publicKey);
    await airdrop(test_env.provider.connection, test_env.voter.publicKey);

    await airdrop(test_env.provider.connection, test_env.NoNFTPartyCreator.publicKey);


    [test_env.VotingInfo, test_env.VotingBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(VOTING_INFO_SEED), test_env.VotingAuthority.publicKey.toBuffer()], test_env.program.programId);
    [test_env.Party, test_env.PartyBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(PARTY_SEED), test_env.PartyCreator.publicKey.toBuffer(), test_env.VotingInfo.toBuffer()], test_env.program.programId);
    [test_env.anotherParty, test_env.anotherPartyBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(PARTY_SEED), test_env.anotherPartyCreator.publicKey.toBuffer(), test_env.VotingInfo.toBuffer()], test_env.program.programId);
    [test_env.NoNFTParty, test_env.NoNFTPartyBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(PARTY_SEED), test_env.NoNFTPartyCreator.publicKey.toBuffer(), test_env.VotingInfo.toBuffer()], test_env.program.programId);

    [test_env.Voter, test_env.VoterBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(VOTER_SEED), test_env.voter.publicKey.toBuffer(), test_env.VotingInfo.toBuffer()], test_env.program.programId);


    test_env.new_mint = await token.createMint(
        test_env.provider.connection,
        test_env.payer,
        test_env.voter.publicKey,
        test_env.voter.publicKey,
        0,
    );


    test_env.token_account = token.getAssociatedTokenAddressSync(test_env.mint.publicKey, test_env.Party, true);
    test_env.another_token_account = token.getAssociatedTokenAddressSync(test_env.another_mint.publicKey, test_env.anotherParty, true);
    test_env.token_account_voter1 = token.getAssociatedTokenAddressSync(test_env.mint_voter1.publicKey, test_env.voter.publicKey, false);
    test_env.token_account_voter2 = token.getAssociatedTokenAddressSync(test_env.mint_voter2.publicKey, test_env.voter.publicKey, false);


    const metaplex = Metaplex.make(test_env.provider.connection);
    // metadatas
    test_env.metadata_account = metaplex.nfts().pdas().metadata({ mint: test_env.mint.publicKey });
    test_env.another_metadata_account = metaplex.nfts().pdas().metadata({ mint: test_env.another_mint.publicKey });

    // master edition
    test_env.master_edition_account = metaplex.nfts().pdas().masterEdition({ mint: test_env.mint.publicKey });
    test_env.another_master_edition_account = metaplex.nfts().pdas().masterEdition({ mint: test_env.another_mint.publicKey });


    // voter metadata 1
    test_env.voter_metadata_account1 = metaplex.nfts().pdas().metadata({ mint: test_env.mint_voter1.publicKey });
    // voter edition 1
    test_env.voter_edition_account1 = metaplex.nfts().pdas().edition({ mint: test_env.mint_voter1.publicKey });
    // voter edition mark 1
    test_env.voter_edition_mark1 = metaplex.nfts().pdas().editionMarker({ mint: test_env.mint.publicKey, edition: toBigNumber(1) });


    // voter metadata 2
    test_env.voter_metadata_account2 = metaplex.nfts().pdas().metadata({ mint: test_env.mint_voter2.publicKey });
    // voter edition 2
    test_env.voter_edition_account2 = metaplex.nfts().pdas().edition({ mint: test_env.mint_voter2.publicKey });
    // voter edition mark 2
    test_env.voter_edition_mark2 = metaplex.nfts().pdas().editionMarker({ mint: test_env.mint_voter2.publicKey, edition: toBigNumber(1) });

    // -----------------------------------------------------------------------------------------------------
    // [test_env.new_metadata_account, test_env.new_metadata_account_bump] = PublicKey.findProgramAddressSync(
    //     [
    //         Buffer.from("metadata"),
    //         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    //         test_env.new_mint.toBuffer(),
    //     ],
    //     TOKEN_METADATA_PROGRAM_ID
    // );

    // [test_env.new_edition_account, test_env.new_edition_account_bump] = PublicKey.findProgramAddressSync(
    //     [
    //         Buffer.from("metadata"),
    //         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    //         test_env.new_mint.toBuffer(),
    //         Buffer.from("edition"),
    //     ],
    //     TOKEN_METADATA_PROGRAM_ID
    // );

    // // -----------------------------------------------------------------------------------------------------
    // const quotient = Math.floor(1 / 248);
    // let as_string = quotient.toString();


    // [test_env.edition_mark, test_env.edition_mark_bump] = PublicKey.findProgramAddressSync(
    //     [anchor.utils.bytes.utf8.encode("metadata"),
    //     TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    //     test_env.mint.publicKey.toBuffer(),
    //     anchor.utils.bytes.utf8.encode("edition"),
    //     anchor.utils.bytes.utf8.encode(as_string)], TOKEN_METADATA_PROGRAM_ID);
}
export async function airdrop(connection: any, address: any, amount = 2000000000) {
    await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

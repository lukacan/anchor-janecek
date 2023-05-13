import * as anchor from "@project-serum/anchor";
import { TestEnviroment } from "./env";
import { PublicKey } from '@solana/web3.js';
import { JanecekMethod } from "../target/types/janecek_method";
import * as token from '@solana/spl-token';


export async function init_env(test_env: TestEnviroment) {
    test_env.provider = anchor.AnchorProvider.env();
    anchor.setProvider(test_env.provider);
    test_env.program = anchor.workspace.JanecekMethod as anchor.Program<JanecekMethod>;

    await airdrop(test_env.provider.connection, test_env.payer.publicKey);
    await airdrop(test_env.provider.connection, test_env.VotingAuthority.publicKey);
    await airdrop(test_env.provider.connection, test_env.NewVotingAuthority.publicKey);
    await airdrop(test_env.provider.connection, test_env.PartyCreator.publicKey);

    [test_env.VotingInfo, test_env.VotingBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("janecek-voting-seed")], test_env.program.programId);
    [test_env.Party, test_env.PartyBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("janecek-party-seed"), test_env.VotingInfo.toBuffer()], test_env.program.programId);




    test_env.mint = await token.createMint(
        test_env.provider.connection,
        test_env.VotingAuthority,
        test_env.VotingAuthority.publicKey,
        test_env.VotingAuthority.publicKey,
        0
    );


    test_env.new_mint = await token.createMint(
        test_env.provider.connection,
        test_env.VotingAuthority,
        test_env.VotingAuthority.publicKey,
        test_env.VotingAuthority.publicKey,
        0,
    );

    test_env.token_account = await token.createAccount(test_env.provider.connection, test_env.payer, test_env.mint, test_env.VotingAuthority.publicKey);
    await token.mintTo(test_env.provider.connection, test_env.payer, test_env.mint, test_env.token_account, test_env.VotingAuthority, 1);

    test_env.new_token_account = await token.createAccount(test_env.provider.connection, test_env.payer, test_env.new_mint, test_env.VotingAuthority.publicKey);
    await token.mintTo(test_env.provider.connection, test_env.payer, test_env.new_mint, test_env.new_token_account, test_env.VotingAuthority, 1);


    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

    [test_env.metadata_account, test_env.metadata_account_bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            test_env.mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    [test_env.master_edition_account, test_env.master_edition_account_bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            test_env.mint.toBuffer(),
            Buffer.from("edition"),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );


    [test_env.new_metadata_account, test_env.new_metadata_account_bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            test_env.new_mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    [test_env.new_edition_account, test_env.new_edition_account_bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            test_env.new_mint.toBuffer(),
            Buffer.from("edition"),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );

    const quotient = Math.floor(1 / 248);
    let as_string = quotient.toString();


    [test_env.edition_mark, test_env.edition_mark_bump] = PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        test_env.mint.toBuffer(),
        anchor.utils.bytes.utf8.encode("edition"),
        anchor.utils.bytes.utf8.encode(as_string)], TOKEN_METADATA_PROGRAM_ID);
}
export async function airdrop(connection: any, address: any, amount = 2000000000) {
    await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

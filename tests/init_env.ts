import * as anchor from "@project-serum/anchor";
import { TestEnviroment } from "./env";
import { PublicKey } from '@solana/web3.js';
import { JanecekMethod } from "../target/types/janecek_method";
import * as token from '@solana/spl-token';


export async function init_env(test_env: TestEnviroment) {
    test_env.provider = anchor.AnchorProvider.env();
    anchor.setProvider(test_env.provider);
    test_env.program = anchor.workspace.JanecekMethod as anchor.Program<JanecekMethod>;
    [test_env.VotingInfo, test_env.VotingBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("janecek-voting-seed")], test_env.program.programId);
    [test_env.Party, test_env.PartyBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("janecek-party-seed"), test_env.VotingInfo.toBuffer()], test_env.program.programId);



    await airdrop(test_env.provider.connection, test_env.payer.publicKey);
    await airdrop(test_env.provider.connection, test_env.VotingAuthority.publicKey);
    await airdrop(test_env.provider.connection, test_env.NewVotingAuthority.publicKey);
    await airdrop(test_env.provider.connection, test_env.PartyCreator.publicKey);

    test_env.mint = await token.createMint(
        test_env.provider.connection,
        test_env.payer,
        test_env.VotingInfo,
        null,
        0
    );
    test_env.token_account = token.getAssociatedTokenAddressSync(test_env.mint, test_env.VotingInfo, true);
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


}
export async function airdrop(connection: any, address: any, amount = 1000000000) {
    await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

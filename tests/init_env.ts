import * as anchor from "@project-serum/anchor";
import { TestEnviroment } from "./env";
import { PublicKey } from '@solana/web3.js';
import { JanecekMethod } from "../target/types/janecek_method";


export async function init_env(test_env: TestEnviroment) {
    test_env.provider = anchor.AnchorProvider.local("http://127.0.0.1:8899");
    anchor.setProvider(test_env.provider);
    test_env.program = anchor.workspace.JanecekMethod as anchor.Program<JanecekMethod>;
    [test_env.VotingInfo, test_env.VotingBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode("janecek-bridge-seed")], test_env.program.programId);

    await airdrop(test_env.provider.connection, test_env.payer.publicKey);
    await airdrop(test_env.provider.connection, test_env.VotingAuthority.publicKey);
    await airdrop(test_env.provider.connection, test_env.NewVotingAuthority.publicKey);

}
export async function airdrop(connection: any, address: any, amount = 1000000000) {
    await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

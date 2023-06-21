import * as anchor from "@project-serum/anchor";
import { TestEnviroment } from "./env";
import { PublicKey } from '@solana/web3.js';
import { JanecekMethod } from "../target/types/janecek_method";

export const VOTING_INFO_SEED = "janecek-voting-seed";
export const PARTY_SEED = "janecek-party-seed";
export const VOTER_SEED = "janecek-voter-seed";
export const PARTY_NAME1 = "Party1";
export const PARTY_NAME2 = "Party2";
export const PARTY_NAME3 = "Party3";
export const PARTY_NAME4 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";




export async function init_env(test_env: TestEnviroment) {
    test_env.provider = anchor.AnchorProvider.env();
    anchor.setProvider(test_env.provider);
    test_env.program = anchor.workspace.JanecekMethod as anchor.Program<JanecekMethod>;

    await airdrop(test_env.provider.connection, test_env.payer.publicKey);
    await airdrop(test_env.provider.connection, test_env.VotingAuthority.publicKey);
    await airdrop(test_env.provider.connection, test_env.NewVotingAuthority.publicKey);
    await airdrop(test_env.provider.connection, test_env.PartyCreator1.publicKey);
    await airdrop(test_env.provider.connection, test_env.PartyCreator2.publicKey);
    await airdrop(test_env.provider.connection, test_env.PartyCreator3.publicKey);
    await airdrop(test_env.provider.connection, test_env.PartyCreator4.publicKey);


    await airdrop(test_env.provider.connection, test_env.VoterCreator.publicKey);


    [test_env.VotingInfo, test_env.VotingBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(VOTING_INFO_SEED), test_env.VotingAuthority.publicKey.toBuffer()], test_env.program.programId);
    [test_env.Party1, test_env.PartyBump1] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(PARTY_SEED), test_env.PartyCreator1.publicKey.toBuffer(), test_env.VotingInfo.toBuffer()], test_env.program.programId);
    [test_env.Party2, test_env.PartyBump2] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(PARTY_SEED), test_env.PartyCreator2.publicKey.toBuffer(), test_env.VotingInfo.toBuffer()], test_env.program.programId);
    [test_env.Party3, test_env.PartyBump3] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(PARTY_SEED), test_env.PartyCreator3.publicKey.toBuffer(), test_env.VotingInfo.toBuffer()], test_env.program.programId);
    [test_env.Party4, test_env.PartyBump4] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(PARTY_SEED), test_env.PartyCreator4.publicKey.toBuffer(), test_env.VotingInfo.toBuffer()], test_env.program.programId);

    [test_env.Voter, test_env.VoterBump] = PublicKey.findProgramAddressSync([anchor.utils.bytes.utf8.encode(VOTER_SEED), test_env.VoterCreator.publicKey.toBuffer(), test_env.VotingInfo.toBuffer()], test_env.program.programId);

}
export async function airdrop(connection: any, address: any, amount = 2000000000) {
    await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

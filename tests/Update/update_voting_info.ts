import * as anchor from "@project-serum/anchor";
import { assert } from "chai";
import { TestEnviroment } from "../env";
import { SystemProgram } from '@solana/web3.js';
import * as token from '@solana/spl-token';
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export async function UpdateVotingInfo(test_env: TestEnviroment) {
    describe("Update Voting Info", async () => {
        it(">>> 1. Others than Voting Authority cannot set Emergency", async () => {
            try {
                await test_env.program.methods
                    .stopVoting()
                    .accounts({
                        votingAuthority: test_env.payer.publicKey,
                        votingInfo: test_env.VotingInfo,
                    })
                    .signers([test_env.payer]).rpc();
                assert.fail()
            } catch (error) {
                const err = anchor.AnchorError.parse(error.logs);
                assert.strictEqual(err.error.errorCode.code, "ConstraintSeeds");
            }

            let votingInfoData = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
            assert.strictEqual(votingInfoData.votingAuthority.toString(), test_env.VotingAuthority.publicKey.toString());
            assert.strictEqual(votingInfoData.emergency, false);
            assert.strictEqual(votingInfoData.bump, test_env.VotingBump);
        });
        it(">>> 2. Set Emergency", async () => {
            await test_env.program.methods
                .stopVoting()
                .accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    votingInfo: test_env.VotingInfo,
                })
                .signers([test_env.VotingAuthority]).rpc();

            let votingInfoData = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
            assert.strictEqual(votingInfoData.votingAuthority.toString(), test_env.VotingAuthority.publicKey.toString());
            assert.strictEqual(votingInfoData.emergency, true);
            assert.strictEqual(votingInfoData.bump, test_env.VotingBump);

        });
        it(">>> 3. Cannot add Party or Voter in Emergency", async () => {
            try {
                await test_env.program.methods.createVoter().accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    votingInfo: test_env.VotingInfo,
                    voterAuthority: test_env.voter.publicKey,
                    voter: test_env.Voter,
                }).signers([test_env.voter]).rpc();
                assert.fail();
            } catch (error) {
                const err = anchor.AnchorError.parse(error.logs);
                assert.strictEqual(err.error.errorCode.code, "VotingInEmergencyMode");
            }
            try {
                const nft_name = "Andrejovo nft";
                const nft_symbol = "ANDNFT";
                const nft_uri = "Andrejovo nft uri";



                await test_env.program.methods
                    .addParty(nft_name, nft_symbol, nft_uri)
                    .accounts({
                        votingAuthority: test_env.VotingAuthority.publicKey,
                        partyCreator: test_env.PartyCreator.publicKey,
                        votingInfo: test_env.VotingInfo,
                        party: test_env.Party,
                        mint: test_env.mint.publicKey,
                        tokenAccount: test_env.token_account,
                        metadataAccount: test_env.metadata_account,
                        masterEditionAccount: test_env.master_edition_account,
                        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                        associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                        tokenProgram: token.TOKEN_PROGRAM_ID,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    })
                    .signers([test_env.VotingAuthority, test_env.PartyCreator, test_env.mint]).rpc();
            } catch (error) {
                const err = anchor.AnchorError.parse(error.logs);
                assert.strictEqual(err.error.errorCode.code, "VotingInEmergencyMode");
            }
        });
        it(">>> 4. Revert Emergency", async () => {
            await test_env.program.methods
                .resetVoting()
                .accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    votingInfo: test_env.VotingInfo,
                })
                .signers([test_env.VotingAuthority]).rpc();

            let votingInfoData = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
            assert.strictEqual(votingInfoData.votingAuthority.toString(), test_env.VotingAuthority.publicKey.toString());
            assert.strictEqual(votingInfoData.emergency, false);
            assert.strictEqual(votingInfoData.bump, test_env.VotingBump);
        });
        it(">>> 5. Update default voting timestamp", async () => {
            let votingInfoDataBefore = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);

            let new_timestamp = new anchor.BN(votingInfoDataBefore.votingTimestamp.toNumber() + 1);

            await test_env.program.methods.changeDefaultTimestamp(new_timestamp).accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
            }).signers([test_env.VotingAuthority]).rpc();

            let votingInfoDataAfter = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
            assert.strictEqual(votingInfoDataAfter.votingTimestamp.toNumber(), new_timestamp.toNumber());
        });
    });

    describe("Start Registrations", async () => {
        it(">>> 1. Cannot add Party or Voter in Initialized Window", async () => {
            try {
                await test_env.program.methods.createVoter().accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    votingInfo: test_env.VotingInfo,
                    voterAuthority: test_env.voter.publicKey,
                    voter: test_env.Voter,
                }).signers([test_env.voter]).rpc();
                assert.fail();
            } catch (error) {
                const err = anchor.AnchorError.parse(error.logs);
                assert.strictEqual(err.error.errorCode.code, "VoterRegistrationsNotAllowed");
            }
            try {
                const nft_name = "Andrejovo nft";
                const nft_symbol = "ANDNFT";
                const nft_uri = "Andrejovo nft uri";



                await test_env.program.methods
                    .addParty(nft_name, nft_symbol, nft_uri)
                    .accounts({
                        votingAuthority: test_env.VotingAuthority.publicKey,
                        partyCreator: test_env.PartyCreator.publicKey,
                        votingInfo: test_env.VotingInfo,
                        party: test_env.Party,
                        mint: test_env.mint.publicKey,
                        tokenAccount: test_env.token_account,
                        metadataAccount: test_env.metadata_account,
                        masterEditionAccount: test_env.master_edition_account,
                        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                        associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                        tokenProgram: token.TOKEN_PROGRAM_ID,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    })
                    .signers([test_env.VotingAuthority, test_env.PartyCreator, test_env.mint]).rpc();
            } catch (error) {
                const err = anchor.AnchorError.parse(error.logs);
                assert.strictEqual(err.error.errorCode.code, "PartyRegistrationsNotAllowed");
            }
        });
        it(">>> 2. Start Registrations", async () => {

            await test_env.program.methods.startRegistrations().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
            }).signers([test_env.VotingAuthority]).rpc();

        });
    })




}

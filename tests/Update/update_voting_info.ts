import * as anchor from "@project-serum/anchor";
import { assert } from "chai";
import { TestEnviroment } from "../env";
import { SystemProgram } from '@solana/web3.js';
import * as constants from "../init_env";


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
                    voterAuthority: test_env.VoterCreator.publicKey,
                    voter: test_env.Voter,
                }).signers([test_env.VoterCreator]).rpc();
                assert.fail();
            } catch (error) {
                const err = anchor.AnchorError.parse(error.logs);
                assert.strictEqual(err.error.errorCode.code, "VotingInEmergencyMode");
            }
            try {
                await test_env.program.methods
                    .addParty(constants.PARTY_NAME1)
                    .accounts({
                        votingAuthority: test_env.VotingAuthority.publicKey,
                        partyCreator: test_env.PartyCreator1.publicKey,
                        votingInfo: test_env.VotingInfo,
                        party: test_env.Party1,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([test_env.VotingAuthority, test_env.PartyCreator1]).rpc();
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
                    voterAuthority: test_env.VoterCreator.publicKey,
                    voter: test_env.Voter,
                }).signers([test_env.VoterCreator]).rpc();
                assert.fail();
            } catch (error) {
                const err = anchor.AnchorError.parse(error.logs);
                assert.strictEqual(err.error.errorCode.code, "VoterRegistrationsNotAllowed");
            }
            try {
                await test_env.program.methods
                    .addParty(constants.PARTY_NAME1)
                    .accounts({
                        votingAuthority: test_env.VotingAuthority.publicKey,
                        partyCreator: test_env.PartyCreator1.publicKey,
                        votingInfo: test_env.VotingInfo,
                        party: test_env.Party1,
                        systemProgram: SystemProgram.programId,
                    })
                    .signers([test_env.VotingAuthority, test_env.PartyCreator1]).rpc();
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
        it(">>> 3. Cannot Update default voting timestamp after Registrations started", async () => {
            let votingInfoDataBefore = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);

            let new_timestamp = new anchor.BN(votingInfoDataBefore.votingTimestamp.toNumber() + 1);

            try {
                await test_env.program.methods.changeDefaultTimestamp(new_timestamp).accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    votingInfo: test_env.VotingInfo,
                }).signers([test_env.VotingAuthority]).rpc();
            } catch (error) {
                const err = anchor.AnchorError.parse(error.logs);
                assert.strictEqual(err.error.errorCode.code, "NotInitialState");
            }
            let votingInfoDataAfter = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
            assert.strictEqual(votingInfoDataAfter.votingTimestamp.toNumber(), votingInfoDataBefore.votingTimestamp.toNumber());
        });
    })




}

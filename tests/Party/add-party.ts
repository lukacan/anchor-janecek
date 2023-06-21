import { assert } from "chai";
import * as anchor from "@project-serum/anchor";
import { TestEnviroment } from "../env";
import { SystemProgram } from '@solana/web3.js';
import { SolanaError } from "../janecek-method-test";
import * as constants from "../init_env";

export async function addParty(test_env: TestEnviroment) {
    it(">>> 1. Add Party Party 1", async () => {
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

        let partyData = await test_env.program.account.party.fetch(test_env.Party1);


        assert.strictEqual(partyData.votingInfo.toString(), test_env.VotingInfo.toString());
        assert.strictEqual(partyData.partyCreator.toString(), test_env.PartyCreator1.publicKey.toString());
        assert.strictEqual(partyData.votes.toNumber(), 0);

    });
    it(">>> 2. Add Party Party 2", async () => {
        await test_env.program.methods
            .addParty(constants.PARTY_NAME2)
            .accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                partyCreator: test_env.PartyCreator2.publicKey,
                votingInfo: test_env.VotingInfo,
                party: test_env.Party2,
                systemProgram: SystemProgram.programId,
            })
            .signers([test_env.VotingAuthority, test_env.PartyCreator2]).rpc();

        let partyData = await test_env.program.account.party.fetch(test_env.Party2);

        assert.strictEqual(partyData.votingInfo.toString(), test_env.VotingInfo.toString());
        assert.strictEqual(partyData.partyCreator.toString(), test_env.PartyCreator2.publicKey.toString());
        assert.strictEqual(partyData.votes.toNumber(), 0);

    });
    it(">>> 3. Add Party Party 3", async () => {
        await test_env.program.methods
            .addParty(constants.PARTY_NAME3)
            .accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                partyCreator: test_env.PartyCreator3.publicKey,
                votingInfo: test_env.VotingInfo,
                party: test_env.Party3,
                systemProgram: SystemProgram.programId,
            })
            .signers([test_env.VotingAuthority, test_env.PartyCreator3]).rpc();

        let partyData = await test_env.program.account.party.fetch(test_env.Party3);

        assert.strictEqual(partyData.votingInfo.toString(), test_env.VotingInfo.toString());
        assert.strictEqual(partyData.partyCreator.toString(), test_env.PartyCreator3.publicKey.toString());
        assert.strictEqual(partyData.votes.toNumber(), 0);

    });
    it(">>> 4. Cannot Re-Initialize", async () => {
        try {
            await test_env.program.methods
                .addParty(constants.PARTY_NAME1)
                .accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    partyCreator: test_env.PartyCreator2.publicKey,
                    votingInfo: test_env.VotingInfo,
                    party: test_env.Party2,
                    systemProgram: SystemProgram.programId,
                })
                .signers([test_env.VotingAuthority, test_env.PartyCreator2]).rpc();
        } catch (error) {
            assert.isTrue(SolanaError.contains(error.logs, "already in use"), error.logs)
        }
    });
    it(">>> 5. Cannot add party with wrong name length", async () => {
        try {
            await test_env.program.methods
                .addParty(constants.PARTY_NAME4)
                .accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    partyCreator: test_env.PartyCreator4.publicKey,
                    votingInfo: test_env.VotingInfo,
                    party: test_env.Party4,
                    systemProgram: SystemProgram.programId,
                })
                .signers([test_env.VotingAuthority, test_env.PartyCreator4]).rpc();
            assert.fail()
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "InvalidPartyName");
        }
    });
}

import { assert } from "chai";
import { TestEnviroment } from "../env";
import * as anchor from "@project-serum/anchor";
import { SystemProgram } from '@solana/web3.js';
import * as token from '@solana/spl-token';
import { Metaplex } from "@metaplex-foundation/js";


const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export async function Vote(test_env: TestEnviroment) {
    before("Start Voting", async () => {
        await test_env.program.methods.startVoting().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
        }).signers([test_env.VotingAuthority]).rpc();
    });
    it(">>> 1. Voter cannot Vote Negative yet", async () => {
        try {
            await test_env.program.methods.voteNeg().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.PartyCreator1.publicKey,
                party: test_env.Party1,
                voterAuthority: test_env.VoterCreator.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.VoterCreator]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "VoteTwoPosFirst");
        }

        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.pos2.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 2. Voter can Vote Positive", async () => {
        await test_env.program.methods.votePos().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            partyCreator: test_env.PartyCreator1.publicKey,
            party: test_env.Party1,
            voterAuthority: test_env.VoterCreator.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.VoterCreator]).rpc();

        const partyData = await test_env.program.account.party.fetch(test_env.Party1);
        assert.strictEqual(partyData.votes.toNumber(), 1);

        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), test_env.Party1.toString());
        assert.strictEqual(voterData.pos2.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());

    });
    it(">>> 3. Voter cannot Vote Negative yet", async () => {
        try {
            await test_env.program.methods.voteNeg().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.PartyCreator1.publicKey,
                party: test_env.Party1,
                voterAuthority: test_env.VoterCreator.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.VoterCreator]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "VoteTwoPosFirst");
        }
        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), test_env.Party1.toString());
        assert.strictEqual(voterData.pos2.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 4. Voter cannot Vote Positive for same Party two times", async () => {
        try {
            await test_env.program.methods.votePos().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.PartyCreator1.publicKey,
                party: test_env.Party1,
                voterAuthority: test_env.VoterCreator.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.VoterCreator]).rpc();
            assert.fail()
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "NoBothPositiveToSame");
        }
        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), test_env.Party1.toString());
        assert.strictEqual(voterData.pos2.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 5. Voter can Vote Positive second time", async () => {
        await test_env.program.methods.votePos().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            partyCreator: test_env.PartyCreator2.publicKey,
            party: test_env.Party2,
            voterAuthority: test_env.VoterCreator.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.VoterCreator]).rpc();

        const partyData = await test_env.program.account.party.fetch(test_env.Party2);
        assert.strictEqual(partyData.votes.toNumber(), 1);

        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), test_env.Party1.toString());
        assert.strictEqual(voterData.pos2.toString(), test_env.Party2.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 6. Voter cannot Vote Positive third time", async () => {

        try {
            await test_env.program.methods.votePos().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.PartyCreator3.publicKey,
                party: test_env.Party3,
                voterAuthority: test_env.VoterCreator.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.VoterCreator]).rpc();
            assert.fail()
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "NoMorePosVotes");
        }
        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);

        assert.strictEqual(voterData.pos1.toString(), test_env.Party1.toString());
        assert.strictEqual(voterData.pos2.toString(), test_env.Party2.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 7. Voter can Vote Negative", async () => {
        await test_env.program.methods.voteNeg().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            partyCreator: test_env.PartyCreator1.publicKey,
            party: test_env.Party1,
            voterAuthority: test_env.VoterCreator.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.VoterCreator]).rpc();

        const partyData = await test_env.program.account.party.fetch(test_env.Party1);
        assert.strictEqual(partyData.votes.toNumber(), 0);
        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);

        assert.strictEqual(voterData.pos1.toString(), test_env.Party1.toString());
        assert.strictEqual(voterData.pos2.toString(), test_env.Party2.toString());
        assert.strictEqual(voterData.neg1.toString(), test_env.Party1.toString());
    });
    it(">>> 8. Voter cannot Vote Negative two times", async () => {
        try {
            await test_env.program.methods.voteNeg().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.PartyCreator1.publicKey,
                party: test_env.Party1,
                voterAuthority: test_env.VoterCreator.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.VoterCreator]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "NoMoreVotes");
        }

        const partyData = await test_env.program.account.party.fetch(test_env.Party1);
        assert.strictEqual(partyData.votes.toNumber(), 0);

        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);

        assert.strictEqual(voterData.pos1.toString(), test_env.Party1.toString());
        assert.strictEqual(voterData.pos2.toString(), test_env.Party2.toString());
        assert.strictEqual(voterData.neg1.toString(), test_env.Party1.toString());
    });

}

import { assert } from "chai";
import { TestEnviroment } from "../env";
import * as anchor from "@project-serum/anchor";

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
                partyCreator: test_env.PartyCreator.publicKey,
                party: test_env.Party,
                voterAuthority: test_env.voter.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.voter]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "VoteTwoPosFirst");
        }
    });
    it(">>> 2. Voter can Vote Positive", async () => {
        await test_env.program.methods.votePos().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            partyCreator: test_env.PartyCreator.publicKey,
            party: test_env.Party,
            voterAuthority: test_env.voter.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.voter]).rpc();

    });
    it(">>> 3. Voter cannot Vote Negative yet", async () => {
        try {
            await test_env.program.methods.voteNeg().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.PartyCreator.publicKey,
                party: test_env.Party,
                voterAuthority: test_env.voter.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.voter]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "VoteTwoPosFirst");
        }
    });
    it(">>> 4. Voter can Vote Positive second time", async () => {
        await test_env.program.methods.votePos().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            partyCreator: test_env.anotherPartyCreator.publicKey,
            party: test_env.anotherParty,
            voterAuthority: test_env.voter.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.voter]).rpc();
    });
    it(">>> 5. Voter cannot Vote Positive third time", async () => {
        try {
            await test_env.program.methods.votePos().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.anotherPartyCreator.publicKey,
                party: test_env.anotherParty,
                voterAuthority: test_env.voter.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.voter]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "NoMorePosVotes");
        }
    });
    it(">>> 6. Voter can Vote Negative", async () => {
        await test_env.program.methods.votePos().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            partyCreator: test_env.anotherPartyCreator.publicKey,
            party: test_env.anotherParty,
            voterAuthority: test_env.voter.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.voter]).rpc();
    });
    it(">>> 7. Voter cannot Vote Negative two times", async () => {
        try {
            await test_env.program.methods.votePos().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.anotherPartyCreator.publicKey,
                party: test_env.anotherParty,
                voterAuthority: test_env.voter.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.voter]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "NoMoreVotes");
        }
    });

}

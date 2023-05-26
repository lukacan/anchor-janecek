import { TestEnviroment } from "../env";

export async function addVoter(test_env: TestEnviroment) {
    it("User can add yourself as Voter", async () => {
        await test_env.program.methods.createVoter().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            voterAuthority: test_env.VoterCreator.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.VoterCreator]).rpc();

    });

}

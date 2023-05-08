import * as anchor from "@project-serum/anchor";
import { assert } from "chai";
import { TestEnviroment } from "../env";


export async function UpdateVotingInfo(test_env: TestEnviroment) {
    it(">> 1. Others than Voting Authority cannot update Voting Authority", async () => {
        try {
            await test_env.program.methods
                .updateVotingInfo(test_env.NewVotingAuthority.publicKey)
                .accounts({
                    votingAuthority: test_env.payer.publicKey,
                    votingInfo: test_env.VotingInfo,
                })
                .signers([test_env.payer]).rpc();
            assert.fail()
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "ConstraintHasOne");
        }

        let votingInfoData = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
        assert.strictEqual(votingInfoData.votingAuthority.toString(), test_env.VotingAuthority.publicKey.toString());
        assert.strictEqual(votingInfoData.emergency, false);
        assert.strictEqual(votingInfoData.bump, test_env.VotingBump);
    });
    it(">> 2. Change Voting Authority and Revert", async () => {
        await test_env.program.methods
            .updateVotingInfo(test_env.NewVotingAuthority.publicKey)
            .accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
            })
            .signers([test_env.VotingAuthority]).rpc();

        let votingInfoData = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
        assert.strictEqual(votingInfoData.votingAuthority.toString(), test_env.NewVotingAuthority.publicKey.toString());
        assert.strictEqual(votingInfoData.emergency, false);
        assert.strictEqual(votingInfoData.bump, test_env.VotingBump);

        // revert
        await test_env.program.methods
            .updateVotingInfo(test_env.VotingAuthority.publicKey)
            .accounts({
                votingAuthority: test_env.NewVotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
            })
            .signers([test_env.NewVotingAuthority]).rpc();

        votingInfoData = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
        assert.strictEqual(votingInfoData.votingAuthority.toString(), test_env.VotingAuthority.publicKey.toString());
        assert.strictEqual(votingInfoData.emergency, false);
        assert.strictEqual(votingInfoData.bump, test_env.VotingBump);


    });
    it(">> 3. Others than Voting Authority cannot set Emergency", async () => {
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
            assert.strictEqual(err.error.errorCode.code, "ConstraintHasOne");
        }

        let votingInfoData = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
        assert.strictEqual(votingInfoData.votingAuthority.toString(), test_env.VotingAuthority.publicKey.toString());
        assert.strictEqual(votingInfoData.emergency, false);
        assert.strictEqual(votingInfoData.bump, test_env.VotingBump);
    });
    it(">> 4. Set Emergency and Revert", async () => {
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


        // revert
        await test_env.program.methods
            .resetVoting()
            .accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
            })
            .signers([test_env.VotingAuthority]).rpc();

        votingInfoData = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
        assert.strictEqual(votingInfoData.votingAuthority.toString(), test_env.VotingAuthority.publicKey.toString());
        assert.strictEqual(votingInfoData.emergency, false);
        assert.strictEqual(votingInfoData.bump, test_env.VotingBump);
    });


}

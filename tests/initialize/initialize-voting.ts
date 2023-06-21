import * as anchor from "@project-serum/anchor";
import { assert } from "chai";
import { TestEnviroment } from "../env";
import { SystemProgram } from '@solana/web3.js';
import { SolanaError } from "../janecek-method-test";
import { airdrop } from "../init_env";




export async function InitializeVoting(test_env: TestEnviroment) {
    it(">> 1. Cannot Mismatch Signer", async () => {
        let tmp_user = anchor.web3.Keypair.generate();
        await airdrop(test_env.provider.connection, tmp_user.publicKey);

        let didNotFail = ""
        try {
            await test_env.program.methods
                .initializeVoting(null)
                .accounts({
                    votingAuthority: test_env.payer.publicKey,
                    votingInfo: test_env.VotingInfo,
                    systemProgram: SystemProgram.programId
                })
                .signers([tmp_user]).rpc();
            didNotFail = "Transaction did not fail with wrong signer"
        } catch (error) {
        }
        assert.strictEqual(didNotFail, "");
    });
    it(">> 2. Initializing Voting", async () => {
        await test_env.program.methods
            .initializeVoting(null)
            .accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                systemProgram: SystemProgram.programId
            })
            .signers([test_env.VotingAuthority]).rpc();

        let votingInfoData = await test_env.program.account.votingInfo.fetch(test_env.VotingInfo);
        assert.strictEqual(votingInfoData.votingAuthority.toString(), test_env.VotingAuthority.publicKey.toString());
        assert.strictEqual(votingInfoData.bump, test_env.VotingBump);
    });
    it(">> 3. Cannot Re-Initialize", async () => {
        try {
            await test_env.program.methods
                .initializeVoting(null)
                .accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    votingInfo: test_env.VotingInfo,
                    systemProgram: SystemProgram.programId
                })
                .signers([test_env.VotingAuthority]).rpc();
            assert.fail()
        } catch (error) {
            assert.isTrue(SolanaError.contains(error.logs, "already in use"), error.logs)
        }
    });


}

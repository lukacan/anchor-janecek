import { assert } from "chai";
import * as anchor from '@project-serum/anchor'
import { TestEnviroment } from "../env";
import { SystemProgram } from '@solana/web3.js';
import * as token from '@solana/spl-token';
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export async function AddParty(test_env: TestEnviroment) {
    it(">> 1. Add Party", async () => {
        try {
            await test_env.program.methods
                .addParty()
                .accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    partyCreator: test_env.PartyCreator.publicKey,
                    votingInfo: test_env.VotingInfo,
                    party: test_env.Party,
                    mint: test_env.mint,
                    tokenAccount: test_env.token_account,
                    systemProgram: SystemProgram.programId,
                    associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenProgram: token.TOKEN_PROGRAM_ID,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    metadataAccount: test_env.metadata_account,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                })
                .signers([test_env.VotingAuthority, test_env.PartyCreator]).rpc();
        } catch (error) {
            console.log(error)
        }



        let partyData = await test_env.program.account.party.fetch(test_env.Party);
        assert.strictEqual(partyData.partyOwner.toString(), test_env.PartyCreator.publicKey.toString());
        assert.strictEqual(partyData.bump, test_env.PartyBump);

        let tokenAccoutnData = await token.getAccount(test_env.provider.connection, test_env.token_account);
        let tokenAmount = tokenAccoutnData.amount;
        assert.strictEqual(tokenAmount, BigInt(1));

        let mintInfo = await token.getMint(test_env.provider.connection, test_env.mint);
        let supply = mintInfo.supply;
        assert.strictEqual(supply, BigInt(1))
    });
}

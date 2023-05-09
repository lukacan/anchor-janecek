import { assert } from "chai";
import { web3 } from "@project-serum/anchor";
import { TestEnviroment } from "../env";
import { SystemProgram, Connection, PublicKey as solanaPubkey } from '@solana/web3.js';
import * as token from '@solana/spl-token';
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";


const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export async function AddParty(test_env: TestEnviroment) {
    it(">> 1. Add Party", async () => {
        const connection = new Connection("http://127.0.0.1:8899", "confirmed");
        const metaplex = Metaplex.make(connection);
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
                    masterEditionAccount: test_env.master_edition_account,
                    rent: web3.SYSVAR_RENT_PUBKEY,
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
        let freeze = mintInfo.freezeAuthority;
        let mint = mintInfo.mintAuthority;
        assert.strictEqual(supply, BigInt(1))
        assert.equal(freeze.toString(), test_env.master_edition_account.toString());
        assert.equal(mint.toString(), test_env.master_edition_account.toString());


        const mint_addr = new solanaPubkey(test_env.mint.toString());
        const token_addr = new solanaPubkey(test_env.token_account.toString());
        const ata_addr = new solanaPubkey(test_env..toString());

        const nft = await metaplex.nfts().findByMint({ mint_addr, token_addr });



    });
}

import { Connection } from "@solana/web3.js";
import { TestEnviroment } from "../env";
import { Metaplex } from "@metaplex-foundation/js";
import { assert } from "chai";
import * as anchor from "@project-serum/anchor";

export async function testNFT(test_env: TestEnviroment) {
    it("Test NFT", async () => {
        //const connection = new Connection("http://127.0.0.1:8899", "confirmed");

        // await test_env.program.methods
        //     .mintNft()
        //     .accounts({
        //         votingAuthority: test_env.VotingAuthority.publicKey,
        //         partyCreator: test_env.PartyCreator.publicKey,
        //         mint: test_env.mint,
        //         newMint: test_env.new_mint,
        //         tokenAccount: test_env.token_account,
        //         newTokenAccount: test_env.new_token_account,
        //         metadataAccount: test_env.metadata_account,
        //         masterEditionAccount: test_env.master_edition_account,
        //         newMetadataAccount: test_env.new_metadata_account,
        //         newEditionAccount: test_env.new_edition_account,
        //         editionMarkPda: test_env.edition_mark,
        //         tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        //         systemProgram: SystemProgram.programId,
        //         tokenProgram: token.TOKEN_PROGRAM_ID,
        //         rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        //     })
        //     .signers([test_env.VotingAuthority, test_env.PartyCreator]).rpc();


        // const nft_new = await Metaplex.nfts().findByMint({ mintAddress: test_env.new_mint });
        // assert.strictEqual(nft_new.updateAuthorityAddress.toString(), test_env.VotingAuthority.publicKey.toString());
        // assert.strictEqual(nft_new.mint.address.toString(), test_env.new_mint.toString());
        // assert.strictEqual(nft_new.name, "Andrej");
        // assert.strictEqual(nft_new.symbol, "Symbol");
        // assert.strictEqual(nft_new.uri, "Uri");
        // assert.strictEqual(nft_new.isMutable, false);
        // assert.strictEqual(nft_new.primarySaleHappened, false);
        // assert.strictEqual(nft_new.sellerFeeBasisPoints, 1);
        // assert.strictEqual(nft_new.creators[0].address.toString(), test_env.Party.toString());
        // assert.strictEqual(nft_new.creators[0].verified, true);
        // assert.strictEqual(nft_new.creators[0].share, 100);
        // assert.strictEqual(nft_new.address.toString(), test_env.new_mint.toString());
        // assert.strictEqual(nft_new.mint.mintAuthorityAddress.toString(), test_env.new_edition_account.toString());
        // assert.strictEqual(nft_new.mint.freezeAuthorityAddress.toString(), test_env.new_edition_account.toString());
        // assert.strictEqual(nft_new.edition.isOriginal, false);
        // assert.strictEqual(nft_new.edition.number.toString(), new anchor.BN(1).toString());
        // assert.strictEqual(nft_new.edition.parent.toString(), test_env.master_edition_account.toString());
        // console.log(nft_new);
    });

}

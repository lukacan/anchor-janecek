import { Connection } from "@solana/web3.js";
import { TestEnviroment } from "../env";
import { Metaplex } from "@metaplex-foundation/js";
import { assert } from "chai";
import * as anchor from "@project-serum/anchor";

export async function testNFT(test_env: TestEnviroment) {
    it("Test NFT", async () => {
        //const connection = new Connection("http://127.0.0.1:8899", "confirmed");




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

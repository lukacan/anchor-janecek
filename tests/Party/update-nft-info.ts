import { Metaplex } from "@metaplex-foundation/js";
import { TestEnviroment } from "../env";
import * as anchor from "@project-serum/anchor";
import { assert } from "chai";


const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);


export async function updateNFTInfo(test_env: TestEnviroment) {
    it(">>> 1. Test if we can update NFT info for Party1", async () => {

        const nft_before = await test_env.metaplex.nfts().findByMint({ mintAddress: test_env.mint.publicKey });

        const new_nft_name = "new Party1 NFT";

        await test_env.program.methods.changeNftData(new_nft_name, nft_before.symbol, nft_before.uri, false).accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            partyCreator: test_env.PartyCreator.publicKey,
            votingInfo: test_env.VotingInfo,
            party: test_env.Party,
            masterMetadata: test_env.metadata_account,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        }).signers([test_env.PartyCreator]).rpc();


        const nft_after = await test_env.metaplex.nfts().findByMint({ mintAddress: test_env.mint.publicKey });

        // update set to party
        assert.strictEqual(nft_after.updateAuthorityAddress.toString(), test_env.Party.toString());
        assert.strictEqual(nft_after.mint.address.toString(), test_env.mint.publicKey.toString());
        // mint and freez set to master edition
        assert.strictEqual(nft_after.mint.mintAuthorityAddress.toString(), test_env.master_edition_account.toString());
        assert.strictEqual(nft_after.mint.freezeAuthorityAddress.toString(), test_env.master_edition_account.toString());
        assert.strictEqual(nft_after.name, new_nft_name);
        assert.strictEqual(nft_after.symbol, nft_before.symbol);
        assert.strictEqual(nft_after.uri, nft_before.uri);
        assert.strictEqual(nft_after.isMutable, false);
        assert.strictEqual(nft_after.primarySaleHappened, false);
        assert.strictEqual(nft_after.sellerFeeBasisPoints, 0);
        assert.strictEqual(nft_after.creators[0].address.toString(), test_env.Party.toString());
        assert.strictEqual(nft_after.creators[0].verified, true);
        assert.strictEqual(nft_after.creators[0].share, 100);
        assert.strictEqual(nft_after.address.toString(), test_env.mint.publicKey.toString());
        assert.strictEqual(nft_after.edition.isOriginal, true);
        assert.strictEqual(nft_after.edition.supply.toString(), new anchor.BN(0).toString());
        assert.strictEqual(nft_after.edition.maxSupply, null);



    });

}

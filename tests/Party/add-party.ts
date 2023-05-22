import { assert } from "chai";
import * as anchor from "@project-serum/anchor";
import { TestEnviroment } from "../env";
import { SystemProgram } from '@solana/web3.js';
import * as token from '@solana/spl-token';
import { Metaplex } from "@metaplex-foundation/js";


const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export async function addParty(test_env: TestEnviroment) {
    it(">> 1. Add Party", async () => {
        const nft_name = "Andrejovo nft";
        const nft_symbol = "ANDNFT";
        const nft_uri = "Andrejovo nft uri";



        await test_env.program.methods
            .addParty(nft_name, nft_symbol, nft_uri)
            .accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                partyCreator: test_env.PartyCreator.publicKey,
                votingInfo: test_env.VotingInfo,
                party: test_env.Party,
                mint: test_env.mint,
                tokenAccount: test_env.token_account,
                metadataAccount: test_env.metadata_account,
                masterEditionAccount: test_env.master_edition_account,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                tokenProgram: token.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([test_env.VotingAuthority, test_env.PartyCreator]).rpc();

        const metaplex = Metaplex.make(test_env.provider.connection);

        const nft = await metaplex.nfts().findByMint({ mintAddress: test_env.mint });

        // update set to party
        assert.strictEqual(nft.updateAuthorityAddress.toString(), test_env.Party.toString());
        assert.strictEqual(nft.mint.address.toString(), test_env.mint.toString());
        // mint and freez set to master edition
        assert.strictEqual(nft.mint.mintAuthorityAddress.toString(), test_env.master_edition_account.toString());
        assert.strictEqual(nft.mint.freezeAuthorityAddress.toString(), test_env.master_edition_account.toString());
        assert.strictEqual(nft.name, nft_name);
        assert.strictEqual(nft.symbol, nft_symbol);
        assert.strictEqual(nft.uri, nft_uri);
        assert.strictEqual(nft.isMutable, true);
        assert.strictEqual(nft.primarySaleHappened, false);
        assert.strictEqual(nft.sellerFeeBasisPoints, 1);
        assert.strictEqual(nft.creators[0].address.toString(), test_env.Party.toString());
        assert.strictEqual(nft.creators[0].verified, true);
        assert.strictEqual(nft.creators[0].share, 100);
        assert.strictEqual(nft.address.toString(), test_env.mint.toString());
        assert.strictEqual(nft.edition.isOriginal, true);
        assert.strictEqual(nft.edition.supply.toString(), new anchor.BN(0).toString());
        assert.strictEqual(nft.edition.maxSupply.toString(), new anchor.BN(10).toString());

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
    });
}

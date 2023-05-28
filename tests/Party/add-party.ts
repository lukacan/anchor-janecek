import { assert } from "chai";
import * as anchor from "@project-serum/anchor";
import { TestEnviroment } from "../env";
import { SystemProgram } from '@solana/web3.js';
import * as token from '@solana/spl-token';
import { Metaplex } from "@metaplex-foundation/js";
import { SolanaError } from "../janecek-method-test";


const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export async function addParty(test_env: TestEnviroment) {
    it(">>> 1. Add Party: Party 1", async () => {
        const nft_name = "Party1 nft";
        const nft_symbol = "PRT1NFT";
        const nft_uri = "Party1 nft uri";

        const additionalComputeBudgetInstruction =
            anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
                units: 800000,
            });
        await test_env.program.methods
            .addPartyNft(nft_name, nft_symbol, nft_uri, null)
            .accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                partyCreator: test_env.PartyCreator.publicKey,
                votingInfo: test_env.VotingInfo,
                party: test_env.Party,
                mint: test_env.mint.publicKey,
                tokenAccount: test_env.token_account,
                metadataAccount: test_env.metadata_account,
                masterEditionAccount: test_env.master_edition_account,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                tokenProgram: token.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([test_env.VotingAuthority, test_env.PartyCreator, test_env.mint]).preInstructions([additionalComputeBudgetInstruction]).rpc();


        const nft = await test_env.metaplex.nfts().findByMint({ mintAddress: test_env.mint.publicKey });

        // update set to party
        assert.strictEqual(nft.updateAuthorityAddress.toString(), test_env.Party.toString());
        assert.strictEqual(nft.mint.address.toString(), test_env.mint.publicKey.toString());
        // mint and freez set to master edition
        assert.strictEqual(nft.mint.mintAuthorityAddress.toString(), test_env.master_edition_account.toString());
        assert.strictEqual(nft.mint.freezeAuthorityAddress.toString(), test_env.master_edition_account.toString());
        assert.strictEqual(nft.name, nft_name);
        assert.strictEqual(nft.symbol, nft_symbol);
        assert.strictEqual(nft.uri, nft_uri);
        assert.strictEqual(nft.isMutable, true);
        assert.strictEqual(nft.primarySaleHappened, false);
        assert.strictEqual(nft.sellerFeeBasisPoints, 0);
        assert.strictEqual(nft.creators[0].address.toString(), test_env.Party.toString());
        assert.strictEqual(nft.creators[0].verified, true);
        assert.strictEqual(nft.creators[0].share, 100);
        assert.strictEqual(nft.address.toString(), test_env.mint.publicKey.toString());
        assert.strictEqual(nft.edition.isOriginal, true);
        assert.strictEqual(nft.edition.supply.toString(), new anchor.BN(0).toString());
        assert.strictEqual(nft.edition.maxSupply, null);

        let partyData = await test_env.program.account.party.fetch(test_env.Party);

        assert.strictEqual(partyData.haveNft, true);
        assert.strictEqual(partyData.votingInfo.toString(), test_env.VotingInfo.toString());
        assert.strictEqual(partyData.partyCreator.toString(), test_env.PartyCreator.publicKey.toString());
        assert.strictEqual(partyData.votes.toNumber(), 0);

    });
    it(">>> 2. Add Party: Party 2", async () => {
        const nft_name = "Party2 nft";
        const nft_symbol = "PRT2NFT";
        const nft_uri = "Party2 nft uri";

        const additionalComputeBudgetInstruction =
            anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
                units: 800000,
            });

        const max_supply = 500;
        await test_env.program.methods
            .addPartyNft(nft_name, nft_symbol, nft_uri, new anchor.BN(500))
            .accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                partyCreator: test_env.anotherPartyCreator.publicKey,
                votingInfo: test_env.VotingInfo,
                party: test_env.anotherParty,
                mint: test_env.another_mint.publicKey,
                tokenAccount: test_env.another_token_account,
                metadataAccount: test_env.another_metadata_account,
                masterEditionAccount: test_env.another_master_edition_account,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                tokenProgram: token.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([test_env.VotingAuthority, test_env.anotherPartyCreator, test_env.another_mint]).preInstructions([additionalComputeBudgetInstruction]).rpc();

        const nft = await test_env.metaplex.nfts().findByMint({ mintAddress: test_env.another_mint.publicKey });

        //console.log(nft);
        // update set to party
        assert.strictEqual(nft.updateAuthorityAddress.toString(), test_env.anotherParty.toString());
        assert.strictEqual(nft.mint.address.toString(), test_env.another_mint.publicKey.toString());
        // mint and freez set to master edition
        assert.strictEqual(nft.mint.mintAuthorityAddress.toString(), test_env.another_master_edition_account.toString());
        assert.strictEqual(nft.mint.freezeAuthorityAddress.toString(), test_env.another_master_edition_account.toString());
        assert.strictEqual(nft.name, nft_name);
        assert.strictEqual(nft.symbol, nft_symbol);
        assert.strictEqual(nft.uri, nft_uri);
        assert.strictEqual(nft.isMutable, true);
        assert.strictEqual(nft.primarySaleHappened, false);
        assert.strictEqual(nft.sellerFeeBasisPoints, 0);
        assert.strictEqual(nft.creators[0].address.toString(), test_env.anotherParty.toString());
        assert.strictEqual(nft.creators[0].verified, true);
        assert.strictEqual(nft.creators[0].share, 100);
        assert.strictEqual(nft.address.toString(), test_env.another_mint.publicKey.toString());
        assert.strictEqual(nft.edition.isOriginal, true);
        assert.strictEqual(nft.edition.supply.toString(), new anchor.BN(0).toString());
        assert.strictEqual(nft.edition.maxSupply.toNumber(), max_supply);

        let partyData = await test_env.program.account.party.fetch(test_env.anotherParty);

        assert.strictEqual(partyData.haveNft, true);
        assert.strictEqual(partyData.votingInfo.toString(), test_env.VotingInfo.toString());
        assert.strictEqual(partyData.partyCreator.toString(), test_env.anotherPartyCreator.publicKey.toString());
        assert.strictEqual(partyData.votes.toNumber(), 0);

    });
    it(">>> 3. Add Party: Party has no NFT", async () => {
        await test_env.program.methods
            .addParty()
            .accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                partyCreator: test_env.NoNFTPartyCreator.publicKey,
                votingInfo: test_env.VotingInfo,
                party: test_env.NoNFTParty,
                systemProgram: SystemProgram.programId,
            })
            .signers([test_env.VotingAuthority, test_env.NoNFTPartyCreator]).rpc();

        let partyData = await test_env.program.account.party.fetch(test_env.NoNFTParty);

        assert.strictEqual(partyData.haveNft, false);
        assert.strictEqual(partyData.votingInfo.toString(), test_env.VotingInfo.toString());
        assert.strictEqual(partyData.partyCreator.toString(), test_env.NoNFTPartyCreator.publicKey.toString());
        assert.strictEqual(partyData.votes.toNumber(), 0);

    });
    it(">>> 4. Cannot Re-Initialize without NFT", async () => {
        try {
            await test_env.program.methods
                .addParty()
                .accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    partyCreator: test_env.NoNFTPartyCreator.publicKey,
                    votingInfo: test_env.VotingInfo,
                    party: test_env.NoNFTParty,
                    systemProgram: SystemProgram.programId,
                })
                .signers([test_env.VotingAuthority, test_env.NoNFTPartyCreator]).rpc();
        } catch (error) {
            assert.isTrue(SolanaError.contains(error.logs, "already in use"), error.logs)
        }
    })
    it(">>> 5. Cannot Re-Initialize with NFT", async () => {
        const nft_name = "Party1 nft";
        const nft_symbol = "PRT1NFT";
        const nft_uri = "Party1 nft uri";

        const additionalComputeBudgetInstruction =
            anchor.web3.ComputeBudgetProgram.setComputeUnitLimit({
                units: 800000,
            });
        try {
            await test_env.program.methods
                .addPartyNft(nft_name, nft_symbol, nft_uri, null)
                .accounts({
                    votingAuthority: test_env.VotingAuthority.publicKey,
                    partyCreator: test_env.PartyCreator.publicKey,
                    votingInfo: test_env.VotingInfo,
                    party: test_env.Party,
                    mint: test_env.mint.publicKey,
                    tokenAccount: test_env.token_account,
                    metadataAccount: test_env.metadata_account,
                    masterEditionAccount: test_env.master_edition_account,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenProgram: token.TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                })
                .signers([test_env.VotingAuthority, test_env.PartyCreator, test_env.mint]).preInstructions([additionalComputeBudgetInstruction]).rpc();
            assert.fail()
        } catch (error) {
            assert.isTrue(SolanaError.contains(error.logs, "already in use"), error.logs)
        }
    })
}

import { assert } from "chai";
import { TestEnviroment } from "../env";
import * as anchor from "@project-serum/anchor";
import { SystemProgram } from '@solana/web3.js';
import * as token from '@solana/spl-token';
import { Metaplex } from "@metaplex-foundation/js";


const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export async function Vote(test_env: TestEnviroment) {
    before("Start Voting", async () => {
        await test_env.program.methods.startVoting().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
        }).signers([test_env.VotingAuthority]).rpc();
    });
    it(">>> 1. Voter cannot Vote Negative yet", async () => {


        try {
            await test_env.program.methods.voteNeg().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.PartyCreator.publicKey,
                party: test_env.Party,
                voterAuthority: test_env.VoterCreator.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.VoterCreator]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "VoteTwoPosFirst");
        }

        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.pos2.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 2. Voter can Vote Positive", async () => {
        const onChainPartyData = await test_env.program.account.party.fetch(test_env.Party);

        await test_env.program.methods.votePosNft().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            partyCreator: onChainPartyData.partyCreator,
            party: test_env.Party,
            voterAuthority: test_env.VoterCreator.publicKey,
            voter: test_env.Voter,
            voterTokenAccount: test_env.token_account_voter1,
            masterMint: onChainPartyData.masterMint,
            masterMetadata: onChainPartyData.masterMetadata,
            masterEdition: onChainPartyData.masterEdition,
            masterTokenRecord: test_env.master_token_record,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: token.TOKEN_PROGRAM_ID,
            instructions: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        }).signers([test_env.VoterCreator]).rpc();


        const partyData = await test_env.program.account.party.fetch(test_env.Party);
        assert.strictEqual(partyData.votes.toNumber(), 1);

        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), test_env.Party.toString());
        assert.strictEqual(voterData.pos2.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());

        const nft_name = "new Party1 NFT";
        const nft_symbol = "PRT1NFT";
        const nft_uri = "Party1 nft uri";


        const voter_nft1 = await test_env.metaplex.nfts().findByMint({ mintAddress: test_env.mint.publicKey });
        //console.log(voter_nft1)
        const voter_token_account = await token.getAccount(test_env.provider.connection, test_env.token_account_voter1);
        // console.log(test_env.mint.publicKey.toString());
        // console.log(voter_token_account)
        const master_mint = await token.getMint(test_env.provider.connection, test_env.mint.publicKey);
        //console.log(master_mint)
        // assert.strictEqual(voter_nft1.updateAuthorityAddress.toString(), test_env.Party.toString());
        // assert.strictEqual(voter_nft1.mint.address.toString(), test_env.mint_voter1.publicKey.toString());
        // assert.strictEqual(voter_nft1.name, nft_name);
        // assert.strictEqual(voter_nft1.symbol, nft_symbol);
        // assert.strictEqual(voter_nft1.uri, nft_uri);
        // assert.strictEqual(voter_nft1.isMutable, false);
        // assert.strictEqual(voter_nft1.primarySaleHappened, false);
        // assert.strictEqual(voter_nft1.sellerFeeBasisPoints, 0);
        // assert.strictEqual(voter_nft1.creators[0].address.toString(), test_env.Party.toString());
        // assert.strictEqual(voter_nft1.creators[0].verified, true);
        // assert.strictEqual(voter_nft1.creators[0].share, 100);
        // assert.strictEqual(voter_nft1.address.toString(), test_env.mint_voter1.publicKey.toString());
        // assert.strictEqual(voter_nft1.mint.mintAuthorityAddress.toString(), test_env.voter_edition_account1.toString());
        // assert.strictEqual(voter_nft1.mint.freezeAuthorityAddress.toString(), test_env.voter_edition_account1.toString());
        // assert.strictEqual(voter_nft1.edition.isOriginal, false);
        // assert.strictEqual(voter_nft1.edition.number.toString(), new anchor.BN(1).toString());
        // assert.strictEqual(voter_nft1.edition.parent.toString(), test_env.master_edition_account.toString());


        // const voter_mint = await token.getMint(test_env.provider.connection, test_env.mint_voter1.publicKey);

        // assert.strictEqual(voter_mint.decimals, 0);
        // assert.strictEqual(voter_mint.freezeAuthority.toString(), test_env.voter_edition_account1.toString());
        // assert.strictEqual(voter_mint.mintAuthority.toString(), test_env.voter_edition_account1.toString());
        // assert.strictEqual(voter_mint.supply, BigInt(1));


    });
    it(">>> 3. Voter cannot Vote Negative yet", async () => {
        try {
            await test_env.program.methods.voteNeg().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.PartyCreator.publicKey,
                party: test_env.Party,
                voterAuthority: test_env.VoterCreator.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.VoterCreator]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "VoteTwoPosFirst");
        }
        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), test_env.Party.toString());
        assert.strictEqual(voterData.pos2.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 4. Voter cannot Vote Positive and want NFT from Party without NFT", async () => {
        const onChainPartyData = await test_env.program.account.party.fetch(test_env.NoNFTParty);


        // this will fail with AccountOwnedByWrongProgram, as token account is not initialized nor have appropriate
        // owner, because this party did not choose to use NFTs as voting reward
        try {
            await test_env.program.methods.votePosNft().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: onChainPartyData.partyCreator,
                party: test_env.NoNFTParty,
                voterAuthority: test_env.VoterCreator.publicKey,
                voter: test_env.Voter,
                voterTokenAccount: test_env.token_account_voter2,
                masterMint: onChainPartyData.masterMint,
                masterMetadata: onChainPartyData.masterMetadata,
                masterEdition: onChainPartyData.masterEdition,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                tokenProgram: token.TOKEN_PROGRAM_ID,
            }).signers([test_env.VoterCreator]).rpc();
            assert.fail()
        } catch (error) {
            console.log(error)
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "AccountOwnedByWrongProgram");
        }
        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), test_env.Party.toString());
        assert.strictEqual(voterData.pos2.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 5. Voter can Vote Positive second time for Party without NFT", async () => {
        await test_env.program.methods.votePos().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            partyCreator: test_env.NoNFTPartyCreator.publicKey,
            party: test_env.NoNFTParty,
            voterAuthority: test_env.VoterCreator.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.VoterCreator]).rpc();

        const partyData = await test_env.program.account.party.fetch(test_env.NoNFTParty);
        assert.strictEqual(partyData.votes.toNumber(), 1);

        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), test_env.Party.toString());
        assert.strictEqual(voterData.pos2.toString(), test_env.NoNFTParty.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 6. Voter cannot Vote Positive third time", async () => {
        const onChainPartyData = await test_env.program.account.party.fetch(test_env.anotherParty);

        try {
            await test_env.program.methods.votePosNft().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: onChainPartyData.partyCreator,
                party: test_env.anotherParty,
                voterAuthority: test_env.VoterCreator.publicKey,
                voter: test_env.Voter,
                voterTokenAccount: test_env.token_account_voter2,
                masterMint: onChainPartyData.masterMint,
                masterMetadata: onChainPartyData.masterMetadata,
                masterEdition: onChainPartyData.masterEdition,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                tokenProgram: token.TOKEN_PROGRAM_ID,
            }).signers([test_env.VoterCreator]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "NoMorePosVotes");
        }
        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);

        assert.strictEqual(voterData.pos1.toString(), test_env.Party.toString());
        assert.strictEqual(voterData.pos2.toString(), test_env.NoNFTParty.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 7. Voter can Vote Negative", async () => {
        await test_env.program.methods.voteNeg().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            partyCreator: test_env.anotherPartyCreator.publicKey,
            party: test_env.anotherParty,
            voterAuthority: test_env.VoterCreator.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.VoterCreator]).rpc();

        const partyData = await test_env.program.account.party.fetch(test_env.anotherParty);
        assert.strictEqual(partyData.votes.toNumber(), -1);
        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);

        assert.strictEqual(voterData.pos1.toString(), test_env.Party.toString());
        assert.strictEqual(voterData.pos2.toString(), test_env.NoNFTParty.toString());
        assert.strictEqual(voterData.neg1.toString(), test_env.anotherParty.toString());
    });
    it(">>> 8. Voter cannot Vote Negative two times", async () => {
        try {
            await test_env.program.methods.voteNeg().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.anotherPartyCreator.publicKey,
                party: test_env.anotherParty,
                voterAuthority: test_env.VoterCreator.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.VoterCreator]).rpc();
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "NoMoreVotes");
        }

        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);

        assert.strictEqual(voterData.pos1.toString(), test_env.Party.toString());
        assert.strictEqual(voterData.pos2.toString(), test_env.NoNFTParty.toString());
        assert.strictEqual(voterData.neg1.toString(), test_env.anotherParty.toString());
    });

}

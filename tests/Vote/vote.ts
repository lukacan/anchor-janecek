import { assert } from "chai";
import { TestEnviroment } from "../env";
import * as anchor from "@project-serum/anchor";
import { SystemProgram } from '@solana/web3.js';
import * as token from '@solana/spl-token';


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
                voterAuthority: test_env.voter.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.voter]).rpc();
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
        await test_env.program.methods.votePosNft().accounts({
            votingAuthority: test_env.VotingAuthority.publicKey,
            votingInfo: test_env.VotingInfo,
            partyCreator: test_env.PartyCreator.publicKey,
            party: test_env.Party,
            voterAuthority: test_env.voter.publicKey,
            voter: test_env.Voter,
            voterMint: test_env.mint_voter1.publicKey,
            voterTokenAccount: test_env.token_account_voter1,
            voterMetadataAccount: test_env.voter_metadata_account1,
            voterEditionAccount: test_env.voter_edition_account1,
            metadataAccount: test_env.metadata_account,
            masterEditionAccount: test_env.master_edition_account,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
            tokenProgram: token.TOKEN_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        }).signers([test_env.voter, test_env.mint_voter1]).rpc();

        const partyData = await test_env.program.account.party.fetch(test_env.Party);
        assert.strictEqual(partyData.votes.toNumber(), 1);

        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), test_env.Party.toString());
        assert.strictEqual(voterData.pos2.toString(), SystemProgram.programId.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());



    });
    it(">>> 3. Voter cannot Vote Negative yet", async () => {
        try {
            await test_env.program.methods.voteNeg().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.PartyCreator.publicKey,
                party: test_env.Party,
                voterAuthority: test_env.voter.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.voter]).rpc();
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
        try {
            await test_env.program.methods.votePosNft().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.NoNFTPartyCreator.publicKey,
                party: test_env.NoNFTParty,
                voterAuthority: test_env.voter.publicKey,
                voter: test_env.Voter,
                voterMint: test_env.mint_voter2.publicKey,
                voterTokenAccount: test_env.token_account_voter2,
                voterMetadataAccount: test_env.voter_metadata_account2,
                voterEditionAccount: test_env.voter_edition_account2,
                metadataAccount: test_env.metadata_account,
                masterEditionAccount: test_env.master_edition_account,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                tokenProgram: token.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).signers([test_env.voter, test_env.mint_voter2]).rpc();
            assert.fail()
        } catch (error) {
            const err = anchor.AnchorError.parse(error.logs);
            assert.strictEqual(err.error.errorCode.code, "PartyDoesNotProvideNFT");
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
            voterAuthority: test_env.voter.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.voter]).rpc();

        const partyData = await test_env.program.account.party.fetch(test_env.NoNFTParty);
        assert.strictEqual(partyData.votes.toNumber(), 1);

        const voterData = await test_env.program.account.voter.fetch(test_env.Voter);
        assert.strictEqual(voterData.pos1.toString(), test_env.Party.toString());
        assert.strictEqual(voterData.pos2.toString(), test_env.NoNFTParty.toString());
        assert.strictEqual(voterData.neg1.toString(), SystemProgram.programId.toString());
    });
    it(">>> 6. Voter cannot Vote Positive third time", async () => {
        try {
            await test_env.program.methods.votePosNft().accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                votingInfo: test_env.VotingInfo,
                partyCreator: test_env.anotherPartyCreator.publicKey,
                party: test_env.anotherParty,
                voterAuthority: test_env.voter.publicKey,
                voter: test_env.Voter,
                voterMint: test_env.mint_voter2.publicKey,
                voterTokenAccount: test_env.token_account_voter2,
                voterMetadataAccount: test_env.voter_metadata_account2,
                voterEditionAccount: test_env.voter_edition_account2,
                metadataAccount: test_env.metadata_account,
                masterEditionAccount: test_env.master_edition_account,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                tokenProgram: token.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            }).signers([test_env.voter, test_env.mint_voter2]).rpc();
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
            voterAuthority: test_env.voter.publicKey,
            voter: test_env.Voter,
        }).signers([test_env.voter]).rpc();

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
                voterAuthority: test_env.voter.publicKey,
                voter: test_env.Voter,
            }).signers([test_env.voter]).rpc();
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

import { assert } from "chai";
import * as anchor from "@project-serum/anchor";
import { TestEnviroment } from "../env";
import { SystemProgram, Connection, PublicKey as solanaPubkey, ComputeBudgetProgram, TransactionInstruction, PublicKey, Transaction } from '@solana/web3.js';
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
                    metadataAccount: test_env.metadata_account,
                    masterEditionAccount: test_env.master_edition_account,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    associatedTokenProgram: token.ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenProgram: token.TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                })
                .signers([test_env.VotingAuthority, test_env.PartyCreator]).rpc();
        } catch (error) {
            console.log(error)
        }

        await test_env.program.methods
            .mintNft()
            .accounts({
                votingAuthority: test_env.VotingAuthority.publicKey,
                partyCreator: test_env.PartyCreator.publicKey,
                mint: test_env.mint,
                newMint: test_env.new_mint,
                tokenAccount: test_env.token_account,
                newTokenAccount: test_env.new_token_account,
                metadataAccount: test_env.metadata_account,
                masterEditionAccount: test_env.master_edition_account,
                newMetadataAccount: test_env.new_metadata_account,
                newEditionAccount: test_env.new_edition_account,
                editionMarkPda: test_env.edition_mark,
                tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                tokenProgram: token.TOKEN_PROGRAM_ID,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            })
            .signers([test_env.VotingAuthority, test_env.PartyCreator]).rpc();
    });
}

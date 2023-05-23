import * as anchor from "@project-serum/anchor";
import { JanecekMethod } from "../target/types/janecek_method";

export class TestEnviroment {
    [x: string]: any;

    // normies
    provider: anchor.AnchorProvider;
    program: anchor.Program<JanecekMethod>;
    payer: anchor.web3.Keypair;


    // voting info
    VotingInfo: anchor.web3.PublicKey;
    VotingBump: number;
    VotingAuthority: anchor.web3.Keypair;
    NewVotingAuthority: anchor.web3.Keypair;


    // party
    PartyCreator: anchor.web3.Keypair;
    Party: anchor.web3.PublicKey;
    PartyBump: number;

    anotherPartyCreator: anchor.web3.Keypair;
    anotherParty: anchor.web3.PublicKey;
    anotherPartyBump: number;

    // voter
    voter: anchor.web3.Keypair;
    Voter: anchor.web3.PublicKey;
    VoterBump: number;


    // mints, tokens, metadata , editions,
    mint: anchor.web3.Keypair;
    token_account: anchor.web3.PublicKey;

    metadata_account: anchor.web3.PublicKey;
    metadata_account_bump: number;

    master_edition_account: anchor.web3.PublicKey;
    master_edition_account_bump: number;


    another_mint: anchor.web3.Keypair;
    another_token_account: anchor.web3.PublicKey;

    another_metadata_account: anchor.web3.PublicKey;
    another_metadata_account_bump: number;

    another_master_edition_account: anchor.web3.PublicKey;
    another_master_edition_account_bump: number;


    new_mint: anchor.web3.PublicKey;
    new_token_account: anchor.web3.PublicKey;

    new_metadata_account: anchor.web3.PublicKey;
    new_metadata_account_bump: number;

    new_edition_account: anchor.web3.PublicKey;
    new_edition_account_bump: number;

    edition_mark: anchor.web3.PublicKey;
    edition_mark_bump: number;

    constructor() {
        this.payer = anchor.web3.Keypair.generate();
        this.VotingAuthority = anchor.web3.Keypair.generate();
        this.NewVotingAuthority = anchor.web3.Keypair.generate();
        this.PartyCreator = anchor.web3.Keypair.generate();
        this.anotherPartyCreator = anchor.web3.Keypair.generate();
        this.mint = anchor.web3.Keypair.generate();
        this.another_mint = anchor.web3.Keypair.generate();

        this.voter = anchor.web3.Keypair.generate();

    }
}

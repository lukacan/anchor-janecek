import * as anchor from "@project-serum/anchor";
import { JanecekMethod } from "../target/types/janecek_method";
import { Metaplex } from "@metaplex-foundation/js";

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


    // parties
    PartyCreator: anchor.web3.Keypair;
    Party: anchor.web3.PublicKey;
    PartyBump: number;

    anotherPartyCreator: anchor.web3.Keypair;
    anotherParty: anchor.web3.PublicKey;
    anotherPartyBump: number;

    NoNFTPartyCreator: anchor.web3.Keypair;
    NoNFTParty: anchor.web3.PublicKey;
    NoNFTPartyBump: number;

    // voter
    VoterCreator: anchor.web3.Keypair;
    Voter: anchor.web3.PublicKey;
    VoterBump: number;

    // pos1
    mint_voter1: anchor.web3.Keypair;
    token_account_voter1: anchor.web3.PublicKey;

    voter_metadata_account1: anchor.web3.PublicKey;
    voter_metadata_account_bump1: number;

    voter_edition_account1: anchor.web3.PublicKey;
    voter_edition_account_bump1: number;

    voter_edition_mark1: anchor.web3.PublicKey;
    voter_edition_mark_bump1: number;


    // pos2
    mint_voter2: anchor.web3.Keypair;
    token_account_voter2: anchor.web3.PublicKey;

    voter_metadata_account2: anchor.web3.PublicKey;
    voter_metadata_account_bump2: number;

    voter_edition_account2: anchor.web3.PublicKey;
    voter_edition_account_bump2: number;

    voter_edition_mark2: anchor.web3.PublicKey;
    voter_edition_mark_bump2: number;


    // mints, tokens, metadata , editions, , token records
    mint: anchor.web3.Keypair;
    token_account: anchor.web3.PublicKey;

    metadata_account: anchor.web3.PublicKey;
    metadata_account_bump: number;

    master_edition_account: anchor.web3.PublicKey;
    master_edition_account_bump: number;

    master_token_record: anchor.web3.PublicKey;


    another_mint: anchor.web3.Keypair;
    another_token_account: anchor.web3.PublicKey;

    another_metadata_account: anchor.web3.PublicKey;
    another_metadata_account_bump: number;

    another_master_edition_account: anchor.web3.PublicKey;
    another_master_edition_account_bump: number;

    metaplex: Metaplex;


    constructor() {
        this.payer = anchor.web3.Keypair.generate();
        this.VotingAuthority = anchor.web3.Keypair.generate();
        this.NewVotingAuthority = anchor.web3.Keypair.generate();
        this.PartyCreator = anchor.web3.Keypair.generate();
        this.anotherPartyCreator = anchor.web3.Keypair.generate();
        this.NoNFTPartyCreator = anchor.web3.Keypair.generate();

        this.mint = anchor.web3.Keypair.generate();
        this.another_mint = anchor.web3.Keypair.generate();

        this.VoterCreator = anchor.web3.Keypair.generate();
        this.mint_voter1 = anchor.web3.Keypair.generate();
        this.mint_voter2 = anchor.web3.Keypair.generate();


    }
}

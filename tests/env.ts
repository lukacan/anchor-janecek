import * as anchor from "@project-serum/anchor";
import { JanecekMethod } from "../target/types/janecek_method";

export class TestEnviroment {

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
    PartyCreator1: anchor.web3.Keypair;
    Party1: anchor.web3.PublicKey;
    PartyBump1: number;

    PartyCreator2: anchor.web3.Keypair;
    Party2: anchor.web3.PublicKey;
    PartyBump2: number;

    PartyCreator3: anchor.web3.Keypair;
    Party3: anchor.web3.PublicKey;
    PartyBump3: number;

    PartyCreator4: anchor.web3.Keypair;
    Party4: anchor.web3.PublicKey;
    PartyBump4: number;

    // voter
    VoterCreator: anchor.web3.Keypair;
    Voter: anchor.web3.PublicKey;
    VoterBump: number;

    constructor() {
        this.payer = anchor.web3.Keypair.generate();
        this.VotingAuthority = anchor.web3.Keypair.generate();
        this.NewVotingAuthority = anchor.web3.Keypair.generate();
        this.PartyCreator1 = anchor.web3.Keypair.generate();
        this.PartyCreator2 = anchor.web3.Keypair.generate();
        this.PartyCreator3 = anchor.web3.Keypair.generate();
        this.PartyCreator4 = anchor.web3.Keypair.generate();

        this.VoterCreator = anchor.web3.Keypair.generate();

    }
}

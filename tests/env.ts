import * as anchor from "@project-serum/anchor";
import { JanecekMethod } from "../target/types/janecek_method";

export class TestEnviroment {
    provider: anchor.AnchorProvider;
    program: anchor.Program<JanecekMethod>;
    payer: anchor.web3.Keypair;

    VotingInfo: anchor.web3.PublicKey;
    VotingBump: number;

    Party: anchor.web3.PublicKey;
    PartyBump: number;

    VotingAuthority: anchor.web3.Keypair;
    NewVotingAuthority: anchor.web3.Keypair;

    PartyCreator: anchor.web3.Keypair;

    mint: anchor.web3.PublicKey;
    token_account: anchor.web3.PublicKey;

    metadata_account: anchor.web3.PublicKey;
    metadata_account_bump: number;

    master_edition_account: anchor.web3.PublicKey;
    master_edition_account_bump: number;


    constructor() {
        this.payer = anchor.web3.Keypair.generate();
        this.VotingAuthority = anchor.web3.Keypair.generate();
        this.NewVotingAuthority = anchor.web3.Keypair.generate();
        this.PartyCreator = anchor.web3.Keypair.generate();

    }
}

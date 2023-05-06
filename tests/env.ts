import * as anchor from "@project-serum/anchor";
import { JanecekMethod } from "../target/types/janecek_method";

export class TestEnviroment {
    provider: anchor.AnchorProvider;
    program: anchor.Program<JanecekMethod>;
    payer: anchor.web3.Keypair;

    VotingInfo: anchor.web3.PublicKey;
    VotingBump: number;

    VotingAuthority: anchor.web3.Keypair;
    NewVotingAuthority: anchor.web3.Keypair;

    constructor() {
        this.payer = anchor.web3.Keypair.generate();
        this.VotingAuthority = anchor.web3.Keypair.generate();
        this.NewVotingAuthority = anchor.web3.Keypair.generate();

    }
}

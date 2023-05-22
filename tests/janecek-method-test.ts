import { TestEnviroment } from "./env";
import { init_env } from "./init_env";
import { InitializeVoting } from "./initialize/initialize-voting";
import { UpdateVotingInfo } from "./update/update_voting_info";
import { AddParty } from "./addParty/add-party";
import { testNFT } from "./nft/test-nft";


describe("Janecek Voting Method", async () => {
  let test_env = new TestEnviroment();

  before("Prepare", async function () {
    await init_env(test_env);
  })
  describe("Inititalize Voting", async () => {
    InitializeVoting(test_env);
  })
  describe("Update Voting Info", async () => {
    UpdateVotingInfo(test_env);
  })
  describe("Add Party", async () => {
    AddParty(test_env);
  })
  // describe("Test NFT", async () => {
  //   testNFT(test_env);
  // })

});

export class SolanaError {
  static contains(logs, error): boolean {
    const match = logs?.filter(s => s.includes(error));
    return Boolean(match?.length)
  }
}

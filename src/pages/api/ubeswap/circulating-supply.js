import { newKit } from "@celo/contractkit";
import ERC20Abi from "../../../abis/ERC20.json";
import LinearReleaseTokenAbi from "../../../abis/ubeswap/LinearReleaseToken.json";
import PoolManagerAbi from "../../../abis/PoolManager.json";
import { toBN, fromWei, toWei } from "web3-utils";

const UBE_ADDRESS = "0x00Be915B9dCf56a3CBE739D9B9c202ca692409EC";
const RELEASE_UBE_ADDRESS = "0x5Ed248077bD07eE9B530f7C40BE0c1dAE4c131C0";
const POOL_MANAGER_ADDRESS = "0x9Ee3600543eCcc85020D6bc77EB553d1747a65D2";
const nonCirculatingAddresses = {
  MiningReleaseEscrow: "0x9d0a92AA8832518328D14Ed5930eC6B44448165e",
  PoolManager: "0x9Ee3600543eCcc85020D6bc77EB553d1747a65D2",
};
const RELEASE_SUPPLY = toBN(toWei("25700000"));

export default async function handler(req, res) {
  const kit = newKit("https://forno.celo.org");
  const ube = new kit.web3.eth.Contract(ERC20Abi, UBE_ADDRESS);

  const totalSupply = toBN(await ube.methods.totalSupply().call());

  let circulatingSupply = totalSupply;

  // Subtract locked CELO
  for (const addr of Object.values(nonCirculatingAddresses)) {
    const balance = await ube.methods.balanceOf(addr).call();
    circulatingSupply = circulatingSupply.sub(toBN(balance));
  }

  // Subtract unclaimed CELO from staking
  const poolManager = new kit.web3.eth.Contract(
    PoolManagerAbi,
    POOL_MANAGER_ADDRESS
  );
  const poolsCount = await poolManager.methods.poolsCount().call();
  const poolAddresses = await Promise.all(
    new Array(Number(poolsCount)).fill(0).map((_, idx) => {
      return poolManager.methods.poolsByIndex(idx).call();
    })
  );
  for (const addr of poolAddresses) {
    const balance = await ube.methods.balanceOf(addr).call();
    circulatingSupply = circulatingSupply.sub(toBN(balance));
  }

  // Subtract locked UBE in release contract
  const releaseUbe = new kit.web3.eth.Contract(
    LinearReleaseTokenAbi,
    RELEASE_UBE_ADDRESS
  );
  const lockedReleaseSupply = RELEASE_SUPPLY.sub(
    toBN(
      await releaseUbe.methods
        .releasableSupplyOfPrincipal(RELEASE_SUPPLY)
        .call()
    )
  );
  circulatingSupply = circulatingSupply.sub(lockedReleaseSupply);

  res
    .status(200)
    .json({ circulatingSupply: fromWei(circulatingSupply.toString()) });
}

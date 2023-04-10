import { ethers } from "ethers";
import { WETH } from "@uniswap/sdk";
import { PROVIDER_URL, PRIVATE_KEY, } from "../config.js";



export function getProvider() {
  return new ethers.providers.JsonRpcProvider(PROVIDER_URL);
}

export async function depositWETH(num:string) {
    const provider = getProvider();
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const abiWETH = ['function deposit() public payable', 'function withdraw(uint wad) public', 'function balanceOf(address owner) public view returns (uint256 balance)'];
    const wethContract = new ethers.Contract(WETH[1].address, abiWETH, wallet);
    let tx = await wethContract.deposit({value: ethers.utils.parseEther(num)});
    tx.wait();
    console.log("WETH deposit success");
}


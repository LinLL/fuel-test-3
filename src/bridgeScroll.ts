import { ethers } from "ethers";
import { SCROLL_BRIDGE_ADDRESS, MY_PRIVATE_KEY } from "../config.js";

async function bridgeScroll(num: string, provider: ethers.providers.BaseProvider,  wallet?: ethers.Signer) {
    const abi = [
        "function depositETH(uint256 _amount, uint256 _gasLimit) external payable",
    ];
    
    if (!wallet){
        console.log("new wallet");
        let json_provider = provider as ethers.providers.JsonRpcProvider;
        wallet = json_provider.getSigner();
    }

    const contract = new ethers.Contract(
        SCROLL_BRIDGE_ADDRESS,
        abi,
        wallet
    );
    
    const balance = await provider.getBalance(wallet.getAddress());
    console.log(balance.toString());
    const txGasLimit = ethers.BigNumber.from(0x9c40);
    const totalAmount = ethers.utils.parseEther(num).mul(ethers.BigNumber.from(10001)).div(ethers.BigNumber.from(10000)).add(txGasLimit);
    console.log(totalAmount.toString());
    let tx = await contract.depositETH(ethers.utils.parseEther(num), 0x9c40, {value: totalAmount, gasLimit: 300000});
    tx.wait();
    console.log(tx);
    console.log("Scroll deposit success");

}
  

 


// const provider = new ethers.provide8rs.JsonRpcProvider();
// await bridgeScroll("0.1", provider);

const goerli_provider =  ethers.getDefaultProvider("goerli");
const wallet = new ethers.Wallet(MY_PRIVATE_KEY, goerli_provider);


bridgeScroll("0.01", goerli_provider, wallet);
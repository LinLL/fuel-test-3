import { ChainId, Token, WETH, Fetcher, Route, Trade, TokenAmount, TradeType, Percent, Pair } from '@uniswap/sdk';
import { ethers, providers } from 'ethers';
import { depositWETH, getProvider } from '../src/depositWETH.js';
import { PRIVATE_KEY, ROUTER_CONTRACT_ADDRESS } from '../config.js';


// geth的ABI
const abigeth = [
    "function balanceOf(address) public view returns(uint)",
    "function deposit() public payable",
    "function transfer(address, uint) public returns (bool)",
    "function withdraw(uint) public",
];


const customHttpProvider = getProvider();
const chainId = ChainId.MAINNET;
const tokenAddress = '0xdD69DB25F6D620A7baD3023c5d32761D353D3De9'; // geth
const geth = new Token(chainId, tokenAddress, 18);

const contractWETH = (new ethers.Contract(WETH[1].address, abigeth, customHttpProvider)).connect(customHttpProvider.getSigner());


async function sendSwapETHToGETH(){
    console.log("start");
    const provider = getProvider();
    const wallet = provider.getSigner();

    
    const currentBlockNum = await provider.getBlockNumber();
    const currentBlock = await provider.getBlock(currentBlockNum);
    const currentBlockTimestamp = currentBlock.timestamp;

    const abiRouter = ['function WETH() view returns (address)', 'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'];
    const routerContract = new ethers.Contract(ROUTER_CONTRACT_ADDRESS, abiRouter, wallet);



    let tx = await routerContract.swapExactETHForTokens(0, [WETH[1].address, geth.address], wallet.getAddress(), currentBlockTimestamp + 100000, {value: ethers.utils.parseEther("1"), gasLimit: 3000000});
    tx.wait();
    console.log("swap success");

}


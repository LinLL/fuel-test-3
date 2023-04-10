import { Wallet, Mnemonic, Account, Provider, WalletUnlocked, Signer, Address, NativeAssetId } from "fuels";
import { FUEL_PROVIDER_URL } from "../config";




const provider = new Provider(FUEL_PROVIDER_URL);


function parseMnemonicToWalletJson(mnemonic: string) {
    const wallet = Wallet.fromMnemonic(mnemonic);
    const result = `address: ${wallet.address}, passwd: q1w2e3R$, recovery_phrase: ${mnemonic}`
    const wallet_json = {'address':wallet.address.toString(), 'recovery_phrase':mnemonic};
    console.log(wallet_json);
    return wallet_json; 
}

export async function transfer(mnemonic: string, toAddressString: string, amount: number) {
    
    const wallet = Wallet.fromMnemonic(mnemonic, undefined, undefined, provider);
    
    const toAddress = Address.fromAddressOrString(toAddressString);
    const tx = await wallet.transfer(toAddress, 100000, NativeAssetId, { gasPrice: 1 });
    tx.wait()
    console.log(`transfer success from ${wallet.address} to ${toAddress} at ${Date.now().toLocaleString()}` );
    return true;
}


function generateWalletList(num: number) {
    const wallets_json = [];
    for (let i=0; i<num; i++){
        const wallet_json = parseMnemonicToWalletJson(Mnemonic.generate());
        wallets_json.push(wallet_json);
    }
}


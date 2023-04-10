import mongoose, { AnyKeys, Model, model, mongo } from "mongoose";
import { FuelSchema, IFuel } from "../model/fuel";
import fs from 'fs';
import { Wallet, Mnemonic, Account, Provider, WalletUnlocked, Signer, Address, NativeAssetId } from "fuels";
import { FUEL_PROVIDER_URL } from "../../config";
import { Promise, map } from "bluebird";


async function connectMongo() {
    await mongoose.connect('mongodb://localhost:27017/fuel');   

    const results = await getAllMnemonic();
    console.log(results);
    
    mongoose.connection.close();

}

export async function getAllMnemonic() {
    const Fuel = model<IFuel>('Fuel', FuelSchema);
    
    const result = await Fuel.find().exec();
    const mnemonics = [];
    for (var f of result){
        mnemonics.push(f.getMnemonic());
    }
    return mnemonics;
    
}


async function updateWalletBalance(balance: number, address: string){
    const Fuel = model<IFuel>('Fuel', FuelSchema);
    const filter = {address: address};
    const update = {balance: balance};
    const query = Fuel.findOneAndUpdate(filter, update);
    await query.exec();
}


async function updateAllWalletBalance() {
    const provider = new Provider(FUEL_PROVIDER_URL);

    const Fuel = model<IFuel>('Fuel', FuelSchema);

    try {
        const result = await Fuel.find().exec();

        const promises = Promise.map(result, async (wallet) => {
            try{
                const walletFuel = Wallet.fromAddress(wallet['address'], provider);
                

                const balanceAccountPromise  = walletFuel.getBalance();
                const balanceAccount = await balanceAccountPromise;
                
                console.log(balanceAccount.toNumber(), wallet.address);
                const account = balanceAccount.formatUnits(9);
            
                await updateWalletBalance(parseFloat(account) , wallet.address);
                return balanceAccount;
  
            }catch(error){
                console.log(error);
                return Promise.reject(error);

            }
        }, {concurrency: 5}); 
        try{
            const results = await Promise.allSettled(promises);
            console.log(results);
        } catch(error) {
            console.log(error);
            return Promise.reject(error);
        }


    } catch (error) {
        console.log(error);
    }
      console.log("update over");
}



//save wallets to mongo
async function saveWalletsToMongo(wallets_json: any){
    const Fuel = model<IFuel>('Fuel', FuelSchema);
    for (const wallet in wallets_json){
        const newWallet = new Fuel({'address':wallet, 'recovery_phrase':wallets_json[wallet]['recovery_phrase']});
        console.log(newWallet);
        await newWallet.save();
    }
}

async function readWalletFromJson() {
    const jsonString =  fs.readFileSync('/Users/a1/scientist/fuel/data/fuelWallets.json');
    const wallets = JSON.parse(jsonString.toString());
    return wallets;
}


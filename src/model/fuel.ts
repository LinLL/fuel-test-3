import { Document, Schema, model } from 'mongoose';

export interface IFuel extends Document {
    address: string;
    passwd: string;
    recovery_phrase: string;
    balance: number
}

export const FuelSchema = new Schema({
    address: { type: String, required: true, unique: true},
    passwd: { type: String, required: true, default: 'q1w2e3R$' },
    recovery_phrase: { type: String, required: true },
    balance: { type: Number, required: true, default: 0 }
});

FuelSchema.methods.getMnemonic = function (){
    return this.recovery_phrase;
}

const Fuel = model<IFuel>('Fuel', FuelSchema);
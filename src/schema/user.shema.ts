import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop()
    username: string;

    @Prop()
    address: string;

    @Prop()
    gate: string;

    @Prop()
    block: number;

    @Prop()
    timestamp: Date;

    @Prop()
    txHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

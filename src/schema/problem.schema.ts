import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProblemDocument = Problem & Document;

@Schema()
export class Problem {
    @Prop()
    id: number;

    @Prop()
    author: string;

    @Prop()
    address: string;

    @Prop()
    checker: string;

    @Prop({ default: false })
    isWhitelisted: boolean;

    @Prop()
    description: string;

    @Prop()
    block: number;

    @Prop()
    timestamp: Date;

    @Prop()
    txHash: string;
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);

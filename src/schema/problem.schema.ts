import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProblemDocument = Problem & Document;

export type SupportedParamType =
    | 'uint256'
    | 'int256'
    | 'string'
    | 'uint256[]'
    | 'int256[]';

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

    @Prop({ default: 'empty' })
    description: string;

    @Prop({ default: [] })
    inputFormat: SupportedParamType[];

    @Prop({ default: [] })
    outputFormat: SupportedParamType[];

    @Prop({ default: 'empty' })
    title: string;

    @Prop({ default: 6969 })
    gasLimit: number;

    @Prop()
    block: number;

    @Prop()
    timestamp: Date;

    @Prop()
    txHash: string;
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);

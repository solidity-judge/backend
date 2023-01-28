import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubmissionDocument = Submission & Document;

@Schema()
export class Submission {
    @Prop()
    id: string;

    @Prop()
    contestant: string;

    @Prop()
    point: number;

    @Prop()
    problem: string;

    @Prop()
    solution: string;

    @Prop()
    version: number;

    @Prop()
    block: number;

    @Prop()
    timestamp: Date;

    @Prop()
    txHash: string;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

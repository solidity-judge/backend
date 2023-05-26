import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContestDocument = Contest & Document;
@Schema()
export class Contest {
    @Prop()
    id: number;

    @Prop()
    deadline: number;

    @Prop({ default: 'empty' })
    description: string;

    @Prop({ default: 'empty' })
    title: string;

    @Prop({ default: [] })
    problems: number[];
}

export const ContestSchema = SchemaFactory.createForClass(Contest);

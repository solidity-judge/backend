import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = Category & Document;

@Schema()
export class Category {
    @Prop()
    key: string;

    @Prop()
    name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

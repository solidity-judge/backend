import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SyncMetadataDocument = SyncMetadata & Document;

@Schema()
export class SyncMetadata {
    @Prop({ default: 0 })
    problems: number;

    @Prop({ default: 0 })
    users: number;

    @Prop({ default: 0 })
    submissions: number;

    @Prop({ default: 0 })
    testVersions: number;
}

export const SyncMetadataSchema = SchemaFactory.createForClass(SyncMetadata);

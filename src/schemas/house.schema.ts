import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class House extends Document {
  @Prop({ required: true })
  house_name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  phone_no: string;

  @Prop({ type: 'ObjectId', required: true })
  owner_id: Types.ObjectId;
}

export const HouseSchema = SchemaFactory.createForClass(House);

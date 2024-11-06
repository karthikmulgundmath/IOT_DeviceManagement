import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { House } from './house.schema';
import { User } from './user.schema';

@Schema()
export class Device extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  measurement: string;

  @Prop({ required: true })
  unit: string;

  @Prop({ type: Types.ObjectId, ref: 'House', required: true })
  house_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  device_owner_id: Types.ObjectId;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

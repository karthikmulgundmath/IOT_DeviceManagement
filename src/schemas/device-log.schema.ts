import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Device } from './device.schema';

@Schema()
export class DeviceLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Device', required: true })
  device_id: Types.ObjectId;

  @Prop({ required: true })
  measurement: number;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true, default: Date.now })
  dateandtime: Date;

  @Prop({ type: Types.ObjectId, ref: 'House', required: true })
  house_id: Types.ObjectId;
}

export const DeviceLogSchema = SchemaFactory.createForClass(DeviceLog);

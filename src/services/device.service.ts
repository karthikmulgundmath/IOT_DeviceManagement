import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Device } from '../schemas/device.schema';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
  ) {}

  async createDevice(deviceData: any): Promise<Device> {
    // Ensure house_id and created_by are cast to ObjectId before saving
    const houseId = new Types.ObjectId(deviceData.house_id); // Cast house_id to ObjectId
    const createdBy = new Types.ObjectId(deviceData.device_owner_id); // Cast created_by to ObjectId

    // Now create the device
    const device = new this.deviceModel({
      name: deviceData.name,
      measurement: deviceData.measurement,
      unit: deviceData.unit,
      house_id: houseId,
      device_owner_id: createdBy,
    });

    return device.save(); // Save the device to the database
  }

  async getDevicesByUser(userId: string): Promise<Device[]> {
    return this.deviceModel
      .find({ device_owner_id: new Types.ObjectId(userId) })
      .exec();
  }

  async getAllDevices(): Promise<Device[]> {
    return this.deviceModel.find().exec();
  }

  async updateDevice(
    deviceId: string,
    userId: string,
    updateData,
  ): Promise<Device> {
    const device = await this.deviceModel.findById(deviceId);

    if (!device) throw new NotFoundException('Device not found');
    if (device.device_owner_id.toString() !== userId)
      throw new ForbiddenException('Access denied');

    Object.assign(device, updateData);
    return device.save();
  }

  async deleteDevice(deviceId: string, userId: string): Promise<void> {
    const device = await this.deviceModel.findById(deviceId);

    if (!device) throw new NotFoundException('Device not found');
    if (device.device_owner_id.toString() !== userId)
      throw new ForbiddenException('Access denied');

    await this.deviceModel.deleteOne({ _id: deviceId }).exec();
  }
}

import { Injectable } from '@nestjs/common';
import * as cron from 'node-cron';
import { DeviceService } from './device.service';
import { DeviceLogsService } from './device-logs.service';
import { Types } from 'mongoose';

@Injectable()
export class CronService {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly deviceLogsService: DeviceLogsService,
  ) {}

  startCronJob() {
    cron.schedule('* * * * *', async () => {
      console.log('Running cron job to simulate device data...');
      const devices = await this.deviceService.getAllDevices();
      devices.forEach(async (device) => {
        const logData = {
          device_id: device._id,
          measurement: Math.random() * 100, // Random value for temperature
          unit: device.unit,
          dateandtime: new Date(),
          house_id: new Types.ObjectId(device.house_id),
        };
        await this.deviceLogsService.createLog(logData);
      });
    });
  }
}

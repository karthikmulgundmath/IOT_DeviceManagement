import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceLogsService } from '../services/device-logs.service';
import { DeviceLogsController } from '../controllers/device-logs.controller';
import { DeviceLog, DeviceLogSchema } from '../schemas/device-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceLog.name, schema: DeviceLogSchema },
    ]),
  ],
  providers: [DeviceLogsService],
  controllers: [DeviceLogsController],
  exports: [DeviceLogsService],
})
export class DeviceLogsModule {}

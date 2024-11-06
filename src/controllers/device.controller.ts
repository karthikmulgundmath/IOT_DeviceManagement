import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeviceService } from '../services/device.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('devices')
@UseGuards(AuthGuard)
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // 1. Add Device
  @Post()
  async addDevice(@Body() body, @Req() req) {
    const userId = req.user.userId;
    const deviceData = {
      ...body,
      device_owner_id: userId,
      house_id: body.house_id,
    };
    const device = await this.deviceService.createDevice(deviceData);
    return {
      status: 'success',
      statusCode: 201,
      data: device,
    };
  }

  // 2. Get Devices (admin sees all; user sees their own)
  @Get()
  async getDevices(@Req() req) {
    let devices;
    if (req.user.role === 'admin') {
      devices = await this.deviceService.getAllDevices();
    } else {
      devices = await this.deviceService.getDevicesByUser(req.user.userId);
    }
    return {
      status: 'success',
      statusCode: 200,
      data: devices,
    };
  }

  // 3. Update Device
  @Put(':id')
  async updateDevice(@Param('id') deviceId: string, @Body() body, @Req() req) {
    const userId = req.user.userId;
    const updatedDevice = await this.deviceService.updateDevice(
      deviceId,
      userId,
      body,
    );
    return {
      status: 'success',
      statusCode: 200,
      data: updatedDevice,
    };
  }

  // 4. Delete Device
  @Delete(':id')
  async deleteDevice(@Param('id') deviceId: string, @Req() req) {
    const userId = req.user.userId;
    await this.deviceService.deleteDevice(deviceId, userId);
    return {
      status: 'success',
      statusCode: 200,
      data: null,
    };
  }
}

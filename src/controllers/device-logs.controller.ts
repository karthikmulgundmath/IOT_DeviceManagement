import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DeviceLogsService } from '../services/device-logs.service';
import { AuthGuard } from '../auth/auth.guard';
import { skip } from 'node:test';

@Controller('device-logs')
@UseGuards(AuthGuard)
export class DeviceLogsController {
  constructor(private readonly deviceLogsService: DeviceLogsService) {}

  // 1. Endpoint for the cron job to add log data
  @Post()
  async createLog(@Body() body) {
    return this.deviceLogsService.createLog(body);
  }

  // 2. Get logs with optional filters (by date, device_id, etc.)
  @Get()
  async getLogs(@Query() query, @Req() req) {
    const filters = {
      device_id: query.device_id,
      house_id: query.house_id,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: query.limit,
      page: query.page,
    };

    // Admins can access all logs, while users only get logs for their own houses.
    if (req.user.role !== 'admin') {
      filters.house_id = req.user.house_id;
    }

    const response = await this.deviceLogsService.getLogs(filters);
    return {
      status: 'success',
      statusCode: 200,
      data: response,
    };
  }
}

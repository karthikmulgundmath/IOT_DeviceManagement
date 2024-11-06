import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeviceLog } from '../schemas/device-log.schema';

@Injectable()
export class DeviceLogsService {
  constructor(
    @InjectModel(DeviceLog.name)
    private readonly deviceLogModel: Model<DeviceLog>,
  ) {}

  // 1. Create a log entry
  async createLog(logData): Promise<DeviceLog> {
    const log = new this.deviceLogModel(logData);
    return log.save();
  }

  // 2. Get logs with filters (date range, device name, etc.)
  async getLogs(filters): Promise<{
    deviceLogs: DeviceLog[];
    totalDocs: number;
    totalPages: number;
    currentPage: number;
  }> {
    const query: any = {};

    try {
      if (filters.device_id) {
        query['device_id'] = new Types.ObjectId(filters.device_id);
      }
      if (filters.house_id) {
        query['house_id'] = new Types.ObjectId(filters.house_id);
      }
    } catch (error) {
      console.error('Invalid ObjectId format:', error);
      throw new Error('Invalid device_id or house_id format');
    }

    if (filters.startDate || filters.endDate) {
      query['dateandtime'] = {};
      if (filters.startDate) {
        query['dateandtime'].$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query['dateandtime'].$lte = new Date(filters.endDate);
      }

      // Remove dateandtime if it’s empty
      if (Object.keys(query['dateandtime']).length === 0) {
        delete query['dateandtime'];
      }
    }

    // Extract limit and page from filters or set default values
    const limit = filters.limit ? parseInt(filters.limit, 10) : 10; // Default limit of 10
    const page = filters.page ? parseInt(filters.page, 10) : 1; // Default page is 1
    const skip = (page - 1) * limit;

    // Fetch the paginated data and total count in parallel
    const [deviceLogs, totalDocs] = await Promise.all([
      this.deviceLogModel.find(query).skip(skip).limit(limit).exec(),
      this.deviceLogModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
      deviceLogs,
      totalDocs,
      totalPages,
      currentPage: page,
    };
  }
}

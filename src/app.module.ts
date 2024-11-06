import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user.module';
import { HouseModule } from './modules/house.module';
import { DeviceModule } from './modules/device.module';
import { DeviceLogsModule } from './modules/device-logs.module';
import { DeviceService } from './services/device.service';
import { DeviceController } from './controllers/device.controller';
import { CronService } from './services/cron.service';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { AuthModule } from './modules/auth.module';

dotenv.config(); // Ensure that this line is at the very top

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI), // Ensure that the MongoDB URI is correct
    UserModule,
    AuthModule,
    HouseModule,
    DeviceModule,
    DeviceLogsModule,
  ],
  providers: [DeviceService, CronService],
  controllers: [DeviceController],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly cronService: CronService) {
    this.cronService.startCronJob(); // Start the cron job when module is initialized
  }

  async onModuleInit() {
    // MongoDB connection setup
    mongoose.connection.on('connected', () => {
      console.log(`MongoDB connected to ${process.env.MONGO_URI}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connection established to ${process.env.MONGO_URI}`);
    } catch (error) {
      console.error(`Failed to connect to MongoDB: ${error.message}`);
    }
  }
}

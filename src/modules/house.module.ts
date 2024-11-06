import { Module, forwardRef } from '@nestjs/common';
import { HouseService } from '../services/house.service';
import { UserModule } from './user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { House, HouseSchema } from '../schemas/house.schema';
import { HouseController } from '../controllers/house.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: House.name, schema: HouseSchema }]),
    forwardRef(() => UserModule),
  ],
  providers: [HouseService, JwtService],
  controllers: [HouseController],
  exports: [HouseService],
})
export class HouseModule {}

import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../modules/auth.module';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

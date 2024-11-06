import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Logger } from '@nestjs/common';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
const port = process.env.PORT || 3000; // or any other port you're using

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port, () => {
    Logger.log(`Application is listening on port ${port}`);
  });
}
bootstrap();

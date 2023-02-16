import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as config from 'config';
import { AppModule } from './app.module';
import { IServerConfig } from './config/config.interface';

async function bootstrap() {
  const serverConfig = config.get<IServerConfig>('server');
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || serverConfig.port;

  await app.listen(port);
  logger.log(`Application listening on ${port}`)
}
bootstrap();

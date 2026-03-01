import { NestFactory } from '@nestjs/core';
// import { WorkerModule } from './worker.module';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('🎂 Agenda Worker started');
}

bootstrap();
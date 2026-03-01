import { Module } from '@nestjs/common';
// import { BirthdayWorkerModule } from './modules/birthday-worker/birthday-worker.module';
import { UsersModule } from './modules/users/users.module';
import { HealthController } from './health/health.controller';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import { BirthdayModule } from './modules/birthday-worker/birthday.module';
import { AgendaModule } from './modules/agenda/agenda.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, appConfig],
    }),
    // BirthdayModule,
    // AgendaModule,
    UsersModule,
    DatabaseModule
  ],
  controllers: [HealthController],
})
export class AppModule {}
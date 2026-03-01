import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { UsersModule } from './modules/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AgendaModule } from './modules/agenda/agenda.module';
import { BirthdayProcessor } from './modules/birthday-worker/birthday.processor';
import { DatabaseModule } from './database/database.module';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import { RepositoryModule } from './repositories/repository.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            load: [databaseConfig, appConfig],
        }),
        DatabaseModule,
        // UsersModule,
        AgendaModule,
        RepositoryModule
    ],
    providers: [BirthdayProcessor],
})
export class AppModule { }
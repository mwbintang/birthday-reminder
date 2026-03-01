import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RepositoryModule } from 'src/repositories/repository.module';
import { BirthdaySchedulerService } from '../birthday/birthday.service';
import { AgendaService } from '../agenda/agenda.service';

@Module({
  imports: [RepositoryModule],
  controllers: [UsersController],
  providers: [UsersService, BirthdaySchedulerService, AgendaService],
})
export class UsersModule {}
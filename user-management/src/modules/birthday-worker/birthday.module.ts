import { Module } from '@nestjs/common';
import { BirthdaySchedulerService } from './birthday.service';

@Module({
  providers: [BirthdaySchedulerService],
  exports: [BirthdaySchedulerService],
})
export class BirthdayModule {}
import { Module } from '@nestjs/common';
import { BirthdayProcessor } from './birthday.processor';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
    imports: [RepositoryModule],
    providers: [BirthdayProcessor],
    exports: [BirthdayProcessor],
})
export class BirthdayWorkerModule { }
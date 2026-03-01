import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RepositoryModule } from 'src/repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
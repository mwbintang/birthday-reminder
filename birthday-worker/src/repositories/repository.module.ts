import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../database/schemas/user.schema';
import { UsersRepository } from './users.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [UsersRepository],
  exports: [UsersRepository], // 👈 export so other modules can use it
})
export class RepositoryModule {}
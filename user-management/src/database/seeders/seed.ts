import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { SeedModule } from './seed.module';

export async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));

  await userModel.deleteMany({});

  await userModel.insertMany([
    {
      name: 'John Doe',
      email: 'john@example.com',
      birthday: new Date('1995-05-15'),
      timezone: 'America/New_York',
    },
    {
      name: 'Jane Smith',
      email: 'jane@example.com',
      birthday: new Date('1992-11-22'),
      timezone: 'Europe/London',
    },
    {
      name: 'Budi Santoso',
      email: 'budi@example.com',
      birthday: new Date('1998-02-10'),
      timezone: 'Asia/Jakarta',
    },
  ]);

  console.log('✅ Seed completed');

  await app.close();
}

if (require.main === module) {
  bootstrap();
}
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { bootstrap } from './seed';
import { SeedModule } from './seed.module';
import { User } from '../schemas/user.schema';

jest.mock('@nestjs/core');

describe('Seed Bootstrap', () => {
  const mockDeleteMany = jest.fn();
  const mockInsertMany = jest.fn();
  const mockClose = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet.mockReturnValue({
      deleteMany: mockDeleteMany,
      insertMany: mockInsertMany,
    });

    (NestFactory.createApplicationContext as jest.Mock).mockResolvedValue({
      get: mockGet,
      close: mockClose,
    });
  });

  it('should seed users correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await bootstrap();

    expect(NestFactory.createApplicationContext).toHaveBeenCalledWith(
      SeedModule,
    );

    expect(mockGet).toHaveBeenCalledWith(
      getModelToken(User.name),
    );

    expect(mockDeleteMany).toHaveBeenCalledWith({});

    expect(mockInsertMany).toHaveBeenCalledTimes(1);

    const insertedUsers = mockInsertMany.mock.calls[0][0];

    expect(insertedUsers).toHaveLength(3);

    expect(insertedUsers[0]).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
      timezone: 'America/New_York',
    });

    expect(consoleSpy).toHaveBeenCalledWith('✅ Seed completed');

    expect(mockClose).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
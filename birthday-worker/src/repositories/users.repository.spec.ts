import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  let repository: UsersRepository;

  const mockExec = jest.fn();
  const mockFindById = jest.fn().mockReturnValue({
    exec: mockExec,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getModelToken('User'),
          useValue: {
            findById: mockFindById,
          },
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find user by id', async () => {
    const user = { _id: '123', name: 'John' };
    mockExec.mockResolvedValue(user);

    const result = await repository.findById('123');

    expect(mockFindById).toHaveBeenCalledWith('123');
    expect(result).toEqual(user);
  });

  it('should return null if user not found', async () => {
    mockExec.mockResolvedValue(null);

    const result = await repository.findById('123');

    expect(result).toBeNull();
  });
});
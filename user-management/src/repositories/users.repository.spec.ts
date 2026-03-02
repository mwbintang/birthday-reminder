import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersRepository } from './users.repository';
import { User } from '../database/schemas/user.schema';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let model: jest.Mocked<Model<any>>;

  const mockUser = {
    _id: 'user-id',
    name: 'Bintang',
    email: 'bintang@mail.com',
  };

  const mockModel = {
    create: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    model = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user', async () => {
      mockModel.create.mockResolvedValue(mockUser);

      const result = await repository.create({ name: 'Bintang' });

      expect(model.create).toHaveBeenCalledWith({ name: 'Bintang' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('count', () => {
    it('should return document count', async () => {
      mockModel.countDocuments.mockResolvedValue(5);

      const result = await repository.count({});

      expect(model.countDocuments).toHaveBeenCalledWith({});
      expect(result).toBe(5);
    });
  });

  describe('findAll', () => {
    it('should return users with pagination and sorting', async () => {
      const execMock = jest.fn().mockResolvedValue([mockUser]);
      const leanMock = jest.fn().mockReturnValue({ exec: execMock });
      const sortMock = jest.fn().mockReturnValue({ lean: leanMock });
      const limitMock = jest.fn().mockReturnValue({ sort: sortMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });

      mockModel.find.mockReturnValue({
        skip: skipMock,
      } as any);

      const result = await repository.findAll({}, 0, 10, { createdAt: -1 });

      expect(model.find).toHaveBeenCalledWith({});
      expect(skipMock).toHaveBeenCalledWith(0);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await repository.findById('user-id');

      expect(model.findById).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await repository.findByEmail('bintang@mail.com');

      expect(model.findOne).toHaveBeenCalledWith({ email: 'bintang@mail.com' });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update and return updated user', async () => {
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await repository.update('user-id', {
        name: 'Updated Name',
      });

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-id',
        { name: 'Updated Name' },
        {
          new: true,
          runValidators: true,
        },
      );

      expect(result).toEqual(mockUser);
    });
  });

  describe('delete', () => {
    it('should delete and return deleted user', async () => {
      mockModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      } as any);

      const result = await repository.delete('user-id');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUser);
    });
  });
});
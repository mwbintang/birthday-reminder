import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from '../../repositories/users.repository';
import { BirthdaySchedulerService } from '../birthday/birthday.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<UsersRepository>;
  let scheduler: jest.Mocked<BirthdaySchedulerService>;

  const existingUser = {
    _id: '1',
    name: 'John',
    email: 'john@mail.com',
    birthday: new Date('2000-01-01'),
    timezone: 'UTC',
  } as any;

  beforeEach(async () => {
    repo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    scheduler = {
      scheduleBirthday: jest.fn(),
      cancelBirthday: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repo },
        { provide: BirthdaySchedulerService, useValue: scheduler },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ======================
  // CREATE USER
  // ======================
  describe('createUser', () => {
    it('throws conflict if email exists', async () => {
      repo.findByEmail.mockResolvedValue(existingUser);

      await expect(
        service.createUser({
          name: 'a',
          email: 'john@mail.com',
          birthday: '2000-01-01',
          timezone: 'UTC',
        } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates user and converts birthday to Date', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockImplementation(async (data) => data as any);

      const result = await service.createUser({
        name: 'a',
        email: 'new@mail.com',
        birthday: '2000-01-01',
        timezone: 'UTC',
      } as any);

      expect(result.birthday).toBeInstanceOf(Date);
      expect(scheduler.scheduleBirthday).toHaveBeenCalled();
    });
  });

  // ======================
  // GET ALL USERS
  // ======================
  describe('getAllUsers', () => {
    it('uses default pagination and sort', async () => {
      repo.count.mockResolvedValue(0);
      repo.findAll.mockResolvedValue([]);

      await service.getAllUsers({} as any);

      expect(repo.findAll).toHaveBeenCalledWith(
        {},
        0,
        10,
        { createdAt: -1 },
      );
    });

    it('applies search filter and desc sort', async () => {
      repo.count.mockResolvedValue(2);
      repo.findAll.mockResolvedValue([existingUser]);

      const result = await service.getAllUsers({
        search: 'john',
        sortBy: 'name',
        sortOrder: 'desc',
        page: 2,
        limit: 5,
      } as any);

      expect(repo.findAll).toHaveBeenCalled();
      expect(result.meta.totalPages).toBe(Math.ceil(2 / 5));
    });
  });

  // ======================
  // GET USER BY ID
  // ======================
  describe('getUserById', () => {
    it('throws when user not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getUserById('1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns user when found', async () => {
      repo.findById.mockResolvedValue(existingUser);
      const result = await service.getUserById('1');
      expect(result).toEqual(existingUser);
    });
  });

  // ======================
  // UPDATE USER
  // ======================
  describe('updateUser', () => {
    it('throws if user not found initially', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.updateUser('1', {} as any))
        .rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws if email conflict with different user', async () => {
      repo.findById.mockResolvedValue(existingUser);
      repo.findByEmail.mockResolvedValue({ _id: '2' } as any);

      await expect(
        service.updateUser('1', { email: 'conflict@mail.com' } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('does NOT throw if email belongs to same user', async () => {
      repo.findById.mockResolvedValue(existingUser);
      repo.findByEmail.mockResolvedValue({ _id: '1' } as any);
      repo.update.mockResolvedValue(existingUser);

      await service.updateUser('1', { email: 'john@mail.com' } as any);
    });

    it('throws if update returns null', async () => {
      repo.findById.mockResolvedValue(existingUser);
      repo.findByEmail.mockResolvedValue(null);
      repo.update.mockResolvedValue(null);

      await expect(
        service.updateUser('1', { name: 'x' } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('reschedules when birthday changes', async () => {
      repo.findById.mockResolvedValue(existingUser);
      repo.findByEmail.mockResolvedValue(null);

      const updated = {
        ...existingUser,
        birthday: new Date('2001-01-01'),
      };

      repo.update.mockResolvedValue(updated);

      await service.updateUser('1', { birthday: '2001-01-01' } as any);

      expect(scheduler.scheduleBirthday).toHaveBeenCalledWith(updated);
    });

    it('reschedules when timezone changes', async () => {
      repo.findById.mockResolvedValue(existingUser);
      repo.findByEmail.mockResolvedValue(null);

      const updated = { ...existingUser, timezone: 'Asia/Jakarta' };
      repo.update.mockResolvedValue(updated);

      await service.updateUser('1', { timezone: 'Asia/Jakarta' } as any);

      expect(scheduler.scheduleBirthday).toHaveBeenCalledWith(updated);
    });

    it('does NOT reschedule if birthday unchanged', async () => {
      repo.findById.mockResolvedValue(existingUser);
      repo.findByEmail.mockResolvedValue(null);
      repo.update.mockResolvedValue(existingUser);

      await service.updateUser('1', { birthday: '2000-01-01' } as any);

      expect(scheduler.scheduleBirthday).not.toHaveBeenCalled();
    });
  });

  // ======================
  // DELETE USER
  // ======================
  describe('deleteUser', () => {
    it('throws if not found', async () => {
      repo.delete.mockResolvedValue(null);
      await expect(service.deleteUser('1'))
        .rejects.toBeInstanceOf(NotFoundException);
    });

    it('deletes and cancels birthday job', async () => {
      repo.delete.mockResolvedValue(existingUser);

      await service.deleteUser('1');

      expect(scheduler.cancelBirthday).toHaveBeenCalledWith('1');
    });
  });
});
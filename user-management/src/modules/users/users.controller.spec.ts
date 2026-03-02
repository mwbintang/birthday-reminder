import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockService = () => ({
  createUser: jest.fn(),
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
});

describe('UsersController', () => {
  let controller: UsersController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useFactory: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService) as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('calls create with body', async () => {
    const dto = { name: 'a' };
    service.createUser.mockResolvedValue('ok');
    await expect(controller.create(dto as any)).resolves.toEqual('ok');
    expect(service.createUser).toHaveBeenCalledWith(dto);
  });

  it('forwards query params for findAll', async () => {
    service.getAllUsers.mockResolvedValue('paged');
    const result = await controller.findAll(2, 5, 's', 'name', 'asc');
    expect(result).toBe('paged');
    expect(service.getAllUsers).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      search: 's',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  });

  it('handles findById', async () => {
    service.getUserById.mockResolvedValue('u');
    expect(await controller.findById('123')).toBe('u');
    expect(service.getUserById).toHaveBeenCalledWith('123');
  });

  it('updates user', async () => {
    const body = { name: 'foo' };
    service.updateUser.mockResolvedValue('updated');
    expect(await controller.update('abc', body as any)).toBe('updated');
    expect(service.updateUser).toHaveBeenCalledWith('abc', body);
  });

  it('deletes user', async () => {
    service.deleteUser.mockResolvedValue(undefined);
    await controller.delete('z');
    expect(service.deleteUser).toHaveBeenCalledWith('z');
  });
});

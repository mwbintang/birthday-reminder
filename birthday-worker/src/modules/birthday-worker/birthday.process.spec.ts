import { Test, TestingModule } from '@nestjs/testing';
import { BirthdayProcessor } from './birthday.processor';
import { AgendaService } from '../agenda/agenda.service';
import { DateTime } from 'luxon';
import { UsersRepository } from '../../repositories/users.repository';

describe('BirthdayProcessor', () => {
  let service: BirthdayProcessor;
  let agendaService: jest.Mocked<AgendaService>;
  let repo: jest.Mocked<UsersRepository>;

  const mockSchedule = jest.fn();

  beforeEach(async () => {
    repo = {
      findById: jest.fn()
    } as any;

    agendaService = {
      getAgenda: jest.fn().mockReturnValue({
        schedule: mockSchedule,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirthdayProcessor,
        { provide: UsersRepository, useValue: repo },
        { provide: AgendaService, useValue: agendaService },
      ],
    }).compile();

    service = module.get<BirthdayProcessor>(BirthdayProcessor);

    jest.clearAllMocks();
  });

  const user = {
    _id: '1',
    name: 'John',
    birthday: new Date('2000-01-01'),
    timezone: 'UTC',
  };

  it('should schedule birthday for this year if not passed', async () => {
    jest.spyOn(DateTime, 'now').mockReturnValue(
      DateTime.fromISO('2025-01-01T00:00:00Z'),
    );

    await service.scheduleUserBirthday(user);

    expect(mockSchedule).toHaveBeenCalled();
  });

  it('should schedule for next year if birthday already passed', async () => {
    jest.spyOn(DateTime, 'now').mockReturnValue(
      DateTime.fromISO('2025-12-31T10:00:00Z'),
    );

    await service.scheduleUserBirthday(user);

    const scheduledDate = mockSchedule.mock.calls[0][0];

    const scheduledYear = DateTime.fromJSDate(scheduledDate).year;
    expect(scheduledYear).toBe(2026);
  });

  it('should handle scheduling errors gracefully', async () => {
    agendaService.getAgenda.mockReturnValueOnce({
      cancel: jest.fn().mockRejectedValue(new Error('fail')),
      schedule: jest.fn(),
    } as any);

    await service.scheduleUserBirthday(user);

    // should not throw
    expect(true).toBe(true);
  });
});

describe('onModuleInit', () => {
  let defineMock: jest.Mock;
  let jobHandler: any;
  let service: BirthdayProcessor;
  let agendaService: jest.Mocked<AgendaService>;
  let repo: jest.Mocked<UsersRepository>;

  const mockSchedule = jest.fn();

  beforeEach(async () => {
    repo = {
      findById: jest.fn()
    } as any;

    agendaService = {
      getAgenda: jest.fn().mockReturnValue({
        schedule: mockSchedule,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirthdayProcessor,
        { provide: UsersRepository, useValue: repo },
        { provide: AgendaService, useValue: agendaService },
      ],
    }).compile();

    service = module.get<BirthdayProcessor>(BirthdayProcessor);

    jest.clearAllMocks();
  });

  beforeEach(() => {
    defineMock = jest.fn((name, handler) => {
      jobHandler = handler; // capture handler to test later
    });

    agendaService.getAgenda.mockReturnValue({
      define: defineMock,
    } as any);

    jest.spyOn(service as any, 'scheduleUserBirthday').mockResolvedValue(undefined);
    jest.spyOn(service['logger'], 'log').mockImplementation(() => {});
  });

  it('should define birthday job and log initialization', async () => {
    await service.onModuleInit();

    expect(defineMock).toHaveBeenCalledWith(
      'send birthday message',
      expect.any(Function),
    );

    expect(service['logger'].log).toHaveBeenCalledWith(
      '🎂 Birthday jobs initialized safely',
    );
  });

  it('should process job when user exists', async () => {
    const user = {
      _id: '1',
      name: 'John',
      email: 'john@mail.com',
      birthday: new Date(),
      timezone: 'UTC',
    };

    repo.findById.mockResolvedValue(user);

    await service.onModuleInit();

    await jobHandler({
      attrs: { data: { userId: '1' } },
    });

    expect(repo.findById).toHaveBeenCalledWith('1');

    expect(service['logger'].log).toHaveBeenCalledWith(
      `🎉 Happy Birthday ${user.name}! Sent to ${user.email}`,
    );

    expect(service['scheduleUserBirthday']).toHaveBeenCalledWith(user);
  });

  it('should do nothing if user not found', async () => {
    repo.findById.mockResolvedValue(null);

    await service.onModuleInit();

    await jobHandler({
      attrs: { data: { userId: '999' } },
    });

    expect(repo.findById).toHaveBeenCalledWith('999');
    expect(service['scheduleUserBirthday']).not.toHaveBeenCalled();
  });
});
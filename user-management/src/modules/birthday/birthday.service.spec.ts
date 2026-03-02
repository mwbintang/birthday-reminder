import { Test, TestingModule } from '@nestjs/testing';
import { BirthdaySchedulerService } from './birthday.service';
import { AgendaService } from '../agenda/agenda.service';
import { DateTime } from 'luxon';

describe('BirthdaySchedulerService', () => {
  let service: BirthdaySchedulerService;
  let agendaService: jest.Mocked<AgendaService>;

  const mockCancel = jest.fn();
  const mockSchedule = jest.fn();

  beforeEach(async () => {
    agendaService = {
      getAgenda: jest.fn().mockReturnValue({
        cancel: mockCancel,
        schedule: mockSchedule,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirthdaySchedulerService,
        { provide: AgendaService, useValue: agendaService },
      ],
    }).compile();

    service = module.get<BirthdaySchedulerService>(BirthdaySchedulerService);

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

    await service.scheduleBirthday(user);

    expect(mockCancel).toHaveBeenCalled();
    expect(mockSchedule).toHaveBeenCalled();
  });

  it('should schedule for next year if birthday already passed', async () => {
    jest.spyOn(DateTime, 'now').mockReturnValue(
      DateTime.fromISO('2025-12-31T10:00:00Z'),
    );

    await service.scheduleBirthday(user);

    const scheduledDate = mockSchedule.mock.calls[0][0];

    const scheduledYear = DateTime.fromJSDate(scheduledDate).year;
    expect(scheduledYear).toBe(2026);
  });

  it('should handle scheduling errors gracefully', async () => {
    agendaService.getAgenda.mockReturnValueOnce({
      cancel: jest.fn().mockRejectedValue(new Error('fail')),
      schedule: jest.fn(),
    } as any);

    await service.scheduleBirthday(user);

    // should not throw
    expect(true).toBe(true);
  });

  it('should cancel birthday job', async () => {
    await service.cancelBirthday('1');

    expect(mockCancel).toHaveBeenCalledWith({
      name: 'send birthday message',
      data: { userId: '1' },
    });
  });

  it('should handle cancel errors gracefully', async () => {
    agendaService.getAgenda.mockReturnValueOnce({
      cancel: jest.fn().mockRejectedValue(new Error('fail')),
    } as any);

    await service.cancelBirthday('1');

    expect(true).toBe(true);
  });
});
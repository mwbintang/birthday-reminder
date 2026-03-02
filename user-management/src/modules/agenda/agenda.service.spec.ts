import { Test, TestingModule } from '@nestjs/testing';
import { AgendaService } from './agenda.service';
import { ConfigService } from '@nestjs/config';

describe('AgendaService', () => {
  let service: AgendaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AgendaService>(AgendaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return agenda instance via getAgenda()', () => {
    const fakeAgenda = { stop: jest.fn() };

    // manually inject private property
    (service as any).agenda = fakeAgenda;

    expect(service.getAgenda()).toBe(fakeAgenda);
  });

  it('should call stop on module destroy if agenda exists', async () => {
    const stopMock = jest.fn();

    (service as any).agenda = { stop: stopMock };

    await service.onModuleDestroy();

    expect(stopMock).toHaveBeenCalled();
  });

  it('should not throw if agenda is undefined on destroy', async () => {
    (service as any).agenda = undefined;

    await expect(service.onModuleDestroy()).resolves.not.toThrow();
  });
});
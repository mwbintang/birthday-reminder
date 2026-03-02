import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgendaService implements OnModuleInit, OnModuleDestroy {
  private agenda: any;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const mongoUri =
      this.configService.get<string>('database.mongoUri') || '';

    // 🔥 dynamic import fixes Jest + ESM problem
    const { Agenda } = await import('agenda');
    const { MongoBackend } = await import('@agendajs/mongo-backend');

    this.agenda = new Agenda({
      backend: new MongoBackend({ address: mongoUri }),
    });

    await this.agenda.start();
  }

  getAgenda() {
    return this.agenda;
  }

  async onModuleDestroy() {
    if (this.agenda) {
      await this.agenda.stop();
    }
  }
}
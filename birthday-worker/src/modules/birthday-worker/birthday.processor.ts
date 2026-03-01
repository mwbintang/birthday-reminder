import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { AgendaService } from '../agenda/agenda.service';
// import { UsersRepository } from '../users/users.repository';
import { DateTime } from 'luxon';
import { UsersRepository } from 'src/repositories/users.repository';
import { AgendaService } from '../agenda/agenda.service';

@Injectable()
export class BirthdayProcessor implements OnModuleInit {
  private readonly logger = new Logger(BirthdayProcessor.name);

  constructor(
    private readonly agendaService: AgendaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async onModuleInit() {
    const agenda = this.agendaService.agenda;

    // Define job
    agenda.define('send birthday message', async (job) => {
      const { userId } = job.attrs.data;

      const user = await this.usersRepository.findById(userId);
      if (!user) return;

      this.logger.log(
        `🎉 Happy Birthday ${user.name}! Sent to ${user.email}`,
      );
    });

    // Schedule daily job check
    await this.scheduleAllUsers();
  }

  async scheduleAllUsers() {
    const users = await this.usersRepository.findAllWithoutPagination();

    for (const user of users) {
      await this.scheduleUserBirthday(user);
    }
  }

  async scheduleUserBirthday(user: any) {
    const now = DateTime.now().setZone(user.timezone);

    const nextBirthday = DateTime.fromJSDate(user.birthday)
      .set({
        year: now.year,
        hour: 9,
        minute: 0,
        second: 0,
      })
      .setZone(user.timezone);

    let scheduledDate = nextBirthday;

    if (nextBirthday < now) {
      scheduledDate = nextBirthday.plus({ years: 1 });
    }

    await this.agendaService.agenda.schedule(
      scheduledDate.toJSDate(),
      'send birthday message',
      { userId: user._id.toString() },
    );
  }
}
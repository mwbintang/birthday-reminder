import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { UsersRepository } from 'src/repositories/users.repository';
import { AgendaService } from '../agenda/agenda.service';

@Injectable()
export class BirthdayProcessor implements OnModuleInit {
  private readonly logger = new Logger(BirthdayProcessor.name);

  private readonly JOB_NAME = 'send birthday message';

  constructor(
    private readonly agendaService: AgendaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async onModuleInit() {
    const agenda = this.agendaService.agenda;

    // 1️⃣ Define job BEFORE scheduling
    agenda.define(this.JOB_NAME, async (job) => {
      const { userId } = job.attrs.data;

      const user = await this.usersRepository.findById(userId);
      if (!user) return;

      this.logger.log(
        `🎉 Happy Birthday ${user.name}! Sent to ${user.email}`,
      );

      // 2️⃣ Reschedule next year automatically
      await this.scheduleUserBirthday(user);
    });

    this.logger.log('🎂 Birthday jobs initialized safely');
  }

  async scheduleUserBirthday(user: any) {
    const agenda = this.agendaService.agenda;

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

    if (nextBirthday <= now) {
      scheduledDate = nextBirthday.plus({ years: 1 });
    }

    await agenda.schedule(
      scheduledDate.toJSDate(),
      this.JOB_NAME,
      { userId: user._id.toString() },
    );

    this.logger.log(
      `Scheduled birthday for user ${user._id} at ${scheduledDate.toISO()}`,
    );
  }
}
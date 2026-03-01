import { Injectable } from '@nestjs/common';
import { AgendaService } from '../agenda/agenda.service';
import { DateTime } from 'luxon';

@Injectable()
export class BirthdaySchedulerService {
    private readonly JOB_NAME = 'send birthday message';

    constructor(private readonly agendaService: AgendaService) { }

    async scheduleBirthday(user: any) {
        try {
            const agenda = this.agendaService.getAgenda();

            const now = DateTime.now().setZone(user.timezone);

            const birthdayThisYear = DateTime.fromJSDate(user.birthday)
                .set({
                    year: now.year,
                    hour: 9,
                    minute: 0,
                    second: 0,
                })
                .setZone(user.timezone);

            let scheduledDate = birthdayThisYear;

            if (birthdayThisYear <= now) {
                scheduledDate = birthdayThisYear.plus({ years: 1 });
            }

            // remove old job
            await agenda.cancel({
                name: this.JOB_NAME,
                data: { userId: user._id.toString() },
            });

            // schedule new job
            await agenda.schedule(
                scheduledDate.toJSDate(),
                this.JOB_NAME,
                { userId: user._id.toString() },
            );

            console.log(
                `🎂 Birthday scheduled for ${user.name} at ${scheduledDate.toISO()}`,
            );
        } catch (error) {
            console.error('Error scheduling birthday:', error);
        }
    }

    async cancelBirthday(userId: string) {
        try {
            const agenda = this.agendaService.getAgenda();

            await agenda.cancel({
                name: this.JOB_NAME,
                data: { userId },
            });

            console.log(`🗑 Birthday job cancelled for ${userId}`);
        } catch (error) {
            console.error('Error cancelling birthday:', error);
        }
    }
}
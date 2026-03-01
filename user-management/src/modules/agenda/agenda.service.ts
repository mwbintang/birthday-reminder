// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { Agenda } from 'agenda';
// import { MongoBackend } from '@agendajs/mongo-backend';

// @Injectable()
// export class AgendaService implements OnModuleInit {
//     public agenda!: Agenda;

//     constructor(private readonly configService: ConfigService) { }

//     async onModuleInit() {
//         const mongoUri =
//             this.configService.get<string>('database.mongoUri') || "";

//         const agenda = new Agenda({
//             backend: new MongoBackend({ address: mongoUri })
//         });
//         this.agenda = agenda;

//         await this.agenda.start();
//     }
// }
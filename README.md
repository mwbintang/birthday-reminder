<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

This repository contains two NestJS services:

* `user-management` – REST API for creating and managing users whose birthdays will be tracked.
* `birthday-worker` – background worker that schedules birthday reminders using Agenda and MongoDB.

The API exposes endpoints under `/api/v1/users` and the Swagger UI is available at `/api/docs` once the
application is running.


## Project setup

```bash
# install dependencies for both service and worker
$ cd user-management && npm install
$ cd ../birthday-worker && npm install
```

## Compile and run the project

### Using Docker (recommended)

A `docker-compose.yml` is provided at the project root. It defines three services: `mongo`, `api` and `worker`.
Run:

```bash
$ docker-compose up --build
```

The API will be listening on `http://localhost:3000` and the worker on port `3001`.

### Running locally without Docker

Each service has its own set of scripts. From the `user-management` folder:

```bash
$ npm run build
$ npm run start:dev     # or start:prod
```

And in `birthday-worker`:

```bash
$ npm run build
$ npm run start:dev
```

Ensure `MONGO_URI` is set appropriately (e.g. `mongodb://localhost:27017/birthday-db`).


## Run tests

Unit tests are located in each service under `src/**/*.spec.ts`. To execute them:

```bash
$ cd user-management && npm run test
$ cd birthday-worker && npm run test
```

E2E tests can be run similarly using `npm run test:e2e` in the appropriate folder. Coverage reports are
generated with `npm run test:cov`.


## API examples

Below are some `curl` examples demonstrating the user endpoints. Replace `localhost:3000` with your host if
running elsewhere.

```bash
# create a user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","birthday":"1985-07-12","timezone":"America/New_York"}'

# list users (first page)
curl http://localhost:3000/api/v1/users?page=1&limit=10

# get a single user
curl http://localhost:3000/api/v1/users/<id>

# update a user
curl -X PUT http://localhost:3000/api/v1/users/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Johnny"}'

# delete a user
curl -X DELETE http://localhost:3000/api/v1/users/<id>
```

## Notes, assumptions & limitations

* **Stateless API** – data is stored in MongoDB; there is no in-memory state.
* **Scheduling** – birthdays are scheduled for 9 AM local time in the user's timezone. If the date has
  already passed for the current year the job is slated for next year.
* **Email uniqueness** – the service enforces unique email addresses, returning `409 Conflict` on
  duplicates.
* **Filtering** – simple text search is performed against name and email; pagination and sorting are
  supported via query parameters.
* **Swagger** – documentation is available at `/api/docs` once the API is running. The swagger
  configuration is minimal and may be enhanced with additional models and security schemes.
* **Worker behavior** – the birthday worker connects to the same MongoDB instance and uses Agenda to
  schedule/cancel jobs. It does not send real messages; it merely logs a placeholder when a job fires.

## Resources

Check out a few resources that may come in handy when working with NestJS:

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

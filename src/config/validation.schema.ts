import * as Joi from 'joi';

export const validationSchema = Joi.object({
  MONGO_URI: Joi.string().uri().required(),

  PORT: Joi.number()
    .port()
    .default(3000),
});
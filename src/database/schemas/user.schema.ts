import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as validator from 'validator';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'Users',
})
export class User {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: 'Invalid email format',
    },
  })
  email: string;

  @Prop({
    required: true,
    type: Date,
  })
  birthday: Date;

  @Prop({
    required: true,
    validate: {
      validator: (value: string) =>
        Intl.supportedValuesOf('timeZone').includes(value),
      message: 'Invalid IANA timezone',
    },
  })
  timezone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Unique index for email (important)
UserSchema.index({ email: 1 }, { unique: true });
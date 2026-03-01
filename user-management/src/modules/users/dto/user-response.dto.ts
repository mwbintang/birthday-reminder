import { Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  birthday: Date;

  @Expose()
  timezone: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
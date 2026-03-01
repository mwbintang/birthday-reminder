import { IsEmail, IsNotEmpty, IsDateString, IsString, IsTimeZone } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsDateString()
  birthday: string;

  @IsNotEmpty()
  @IsString()
  @IsTimeZone()
  timezone: string;
}
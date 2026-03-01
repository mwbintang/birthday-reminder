import { IsEmail, IsNotEmpty, IsDateString, IsString } from 'class-validator';

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
  timezone: string;
}
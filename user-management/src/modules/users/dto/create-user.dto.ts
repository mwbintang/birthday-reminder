import { IsEmail, IsNotEmpty, IsDateString, IsString, IsTimeZone } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1990-02-20' })
  @IsDateString()
  birthday: string;

  @ApiProperty({ example: 'America/New_York' })
  @IsNotEmpty()
  @IsString()
  @IsTimeZone()
  timezone: string;
}
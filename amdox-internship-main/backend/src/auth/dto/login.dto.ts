import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@nexaops.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Demo@2026!' })
  @IsString() @IsNotEmpty()
  password: string;
}

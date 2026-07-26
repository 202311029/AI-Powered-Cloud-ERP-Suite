import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'nexaops.com' })
  @IsString() @IsNotEmpty()
  domain: string;

  @ApiProperty({ example: 'NexaOps Manufacturing' })
  @IsString() @IsNotEmpty()
  tenantName: string;

  @ApiProperty({ example: 'admin@nexaops.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Demo@2026!' })
  @IsString() @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Arjun' })
  @IsString() @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString() @IsNotEmpty()
  lastName: string;
}

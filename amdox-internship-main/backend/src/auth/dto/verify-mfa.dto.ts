import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyMfaDto {
  @ApiProperty({ example: '123456' })
  @IsString() @Length(6, 6)
  token: string;
}

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClosePeriodDto {
  @ApiProperty() @IsString() @IsNotEmpty() periodId: string;
}

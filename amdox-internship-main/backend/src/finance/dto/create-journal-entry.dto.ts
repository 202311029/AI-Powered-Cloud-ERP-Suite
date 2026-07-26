import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JournalLineDto {
  @ApiProperty() @IsString() @IsNotEmpty() accountId: string;
  @ApiProperty({ enum: ['Debit', 'Credit'] }) @IsEnum(['Debit', 'Credit']) type: 'Debit' | 'Credit';
  @ApiProperty() @IsNumber() amount: number;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class CreateJournalEntryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() date?: string;
  @ApiPropertyOptional({ default: 'INR' }) @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional({ default: 1.0 }) @IsOptional() @IsNumber() exchangeRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() periodId?: string;

  @ApiProperty({ type: [JournalLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  lines: JournalLineDto[];
}

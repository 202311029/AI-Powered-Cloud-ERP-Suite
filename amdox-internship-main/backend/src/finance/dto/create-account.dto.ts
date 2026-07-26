import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AccountTypeEnum { Asset = 'Asset', Liability = 'Liability', Equity = 'Equity', Revenue = 'Revenue', Expense = 'Expense' }

export class CreateAccountDto {
  @ApiProperty({ example: '6000' })
  @IsString() @IsNotEmpty() code: string;

  @ApiProperty({ example: 'Technology Expense' })
  @IsString() @IsNotEmpty() name: string;

  @ApiProperty({ enum: AccountTypeEnum })
  @IsEnum(AccountTypeEnum) type: AccountTypeEnum;

  @ApiPropertyOptional() @IsOptional() @IsString() parentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

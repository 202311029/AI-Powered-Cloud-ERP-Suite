import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SupplyController } from './supply.controller';
import { SupplyService } from './supply.service';

@Module({
  imports: [HttpModule],
  controllers: [SupplyController],
  providers: [SupplyService],
  exports: [SupplyService],
})
export class SupplyModule {}

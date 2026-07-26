import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SupplyService } from './supply.service';

@ApiTags('Supply')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('supply')
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}

  @Get('vendors')
  @ApiOperation({ summary: 'List vendors' })
  getVendors(@Query('isActive') isActive?: boolean) { return this.supplyService.getVendors(isActive); }

  @Post('vendors')
  @ApiOperation({ summary: 'Create vendor' })
  createVendor(@Body() data: any, @CurrentUser() user: any) { return this.supplyService.createVendor(data, user.userId); }

  @Get('purchase-orders')
  @ApiOperation({ summary: 'List purchase orders' })
  getPurchaseOrders(@Query('status') status?: string) { return this.supplyService.getPurchaseOrders(status); }

  @Post('purchase-orders')
  @ApiOperation({ summary: 'Create purchase order' })
  createPO(@Body() data: any, @CurrentUser() user: any) { return this.supplyService.createPurchaseOrder(data, user.userId); }

  @Put('purchase-orders/:id/approve')
  @ApiOperation({ summary: 'Approve purchase order' })
  approvePO(@Param('id') id: string, @CurrentUser() user: any) { return this.supplyService.approvePO(id, user.userId); }

  @Get('inventory')
  @ApiOperation({ summary: 'List inventory items with stock levels' })
  getInventory(@Query('category') category?: string) { return this.supplyService.getInventory(category); }

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'Get items below reorder level' })
  getLowStock() { return this.supplyService.getLowStockItems(); }

  @Post('inventory')
  @ApiOperation({ summary: 'Create inventory item' })
  createItem(@Body() data: any, @CurrentUser() user: any) { return this.supplyService.createInventoryItem(data, user.userId); }

  @Get('warehouses')
  @ApiOperation({ summary: 'List warehouses' })
  getWarehouses() { return this.supplyService.getWarehouses(); }

  @Post('goods-receipts')
  @ApiOperation({ summary: 'Create goods receipt (updates stock)' })
  createGR(@Body() data: any, @CurrentUser() user: any) { return this.supplyService.createGoodsReceipt(data, user.userId); }

  @Get('forecasts')
  @ApiOperation({ summary: 'Get demand forecasts' })
  getForecasts(@Query('itemId') itemId?: string) { return this.supplyService.getDemandForecasts(itemId); }

  @Post('forecasts/:itemId/trigger')
  @ApiOperation({ summary: 'Trigger AI demand forecast for item' })
  triggerForecast(@Param('itemId') itemId: string) { return this.supplyService.triggerForecast(itemId); }
}

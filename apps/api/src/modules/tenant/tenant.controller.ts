import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get('settings')
  @Roles('SUPER_ADMIN')
  async getSettings(@Request() req) {
    return this.tenantService.getSettings(req.user.tenantId);
  }

  @Put('settings')
  @Roles('SUPER_ADMIN')
  async updateSettings(@Request() req, @Body() settings: any) {
    return this.tenantService.updateSettings(req.user.tenantId, settings);
  }
}

import { Controller, Get, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('global')
  @SetPermissions('settings.office')
  async getGlobalSettings(@Req() req: any) {
    try {
      return await this.settingsService.getGlobalSettings(req.user.tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('global')
  @SetPermissions('settings.office')
  async updateGlobalSettings(@Req() req: any, @Body() settings: any) {
    try {
      return await this.settingsService.updateGlobalSettings(req.user.tenantId, settings);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

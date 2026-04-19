import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('global')
  getGlobalSettings(@Req() req: any) {
    return this.settingsService.getGlobalSettings(req.user.tenantId);
  }

  @Post('global')
  updateGlobalSettings(@Req() req: any, @Body() settings: any) {
    return this.settingsService.updateGlobalSettings(req.user.tenantId, settings);
  }
}

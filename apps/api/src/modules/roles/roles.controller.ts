import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @SetPermissions('roles.manage')
  async getAllRoles(@Req() req: any) {
    return this.rolesService.getAllRoles();
  }

  @Get('permissions')
  @SetPermissions('roles.manage')
  async getAvailablePermissions() {
    return this.rolesService.getAvailablePermissions();
  }

  @Get(':id')
  @SetPermissions('roles.manage')
  async getRoleById(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @Post()
  @SetPermissions('roles.manage')
  async createRole(@Body() body: { name: string; slug: string; permissions: string[] }) {
    return this.rolesService.createRole(body);
  }

  @Put(':id')
  @SetPermissions('roles.manage')
  async updateRole(@Param('id') id: string, @Body() body: any) {
    return this.rolesService.updateRole(id, body);
  }

  @Delete(':id')
  @SetPermissions('roles.manage')
  async deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
}

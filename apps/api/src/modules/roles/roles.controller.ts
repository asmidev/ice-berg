import { Controller, Get, Post, Put, Delete, Body, Param, Req, HttpException, HttpStatus } from '@nestjs/common';
import { RolesService } from './roles.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @SetPermissions('roles.view')
  async getAllRoles(@Req() req: any) {
    try {
      return await this.rolesService.getAllRoles();
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('permissions')
  @SetPermissions('roles.view', 'roles.update', 'roles.create')
  async getAvailablePermissions() {
    try {
      return await this.rolesService.getAvailablePermissions();
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @SetPermissions('roles.view')
  async getRoleById(@Param('id') id: string) {
    try {
      return await this.rolesService.getRoleById(id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @SetPermissions('roles.create')
  async createRole(@Body() body: { name: string; slug: string; permissions: string[] }) {
    try {
      return await this.rolesService.createRole(body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @SetPermissions('roles.update')
  async updateRole(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.rolesService.updateRole(id, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @SetPermissions('roles.delete')
  async deleteRole(@Param('id') id: string) {
    try {
      return await this.rolesService.deleteRole(id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}


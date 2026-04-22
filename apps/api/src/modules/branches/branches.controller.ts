import { Controller, Get, Post, Put, Delete, Body, Param, Req, HttpException, HttpStatus } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @SetPermissions('branches.view')
  async getAll(@Req() req: any) {
    try {
      return await this.branchesService.getAllBranches(req.user.tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('clean-mock')
  @SetPermissions('settings.office')
  async cleanMock(@Req() req: any) {
    try {
      return await this.branchesService.cleanMockBranches(req.user.tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @SetPermissions('branches.view')
  async getOne(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.branchesService.getBranchById(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @SetPermissions('branches.create')
  async create(@Req() req: any, @Body() body: { name: string, address?: string }) {
    try {
      return await this.branchesService.createBranch(req.user.tenantId, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @SetPermissions('branches.update')
  async update(@Req() req: any, @Param('id') id: string, @Body() body: { name?: string, address?: string, settings?: any }) {
    try {
      return await this.branchesService.updateBranch(req.user.tenantId, id, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/gateways')
  @SetPermissions('branches.update')
  async updateGateways(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    try {
      return await this.branchesService.updateGateways(req.user.tenantId, id, body);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @SetPermissions('branches.delete')
  async remove(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.branchesService.deleteBranch(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { BranchesService } from './branches.service';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  getAll(@Req() req: any) {
    return this.branchesService.getAllBranches(req.user.tenantId);
  }

  @Get('clean-mock')
  async cleanMock(@Req() req: any) {
     return this.branchesService.cleanMockBranches(req.user.tenantId);
  }

  @Get(':id')
  getOne(@Req() req: any, @Param('id') id: string) {
    return this.branchesService.getBranchById(req.user.tenantId, id);
  }

  @Post()
  create(@Req() req: any, @Body() body: { name: string, address?: string }) {
    return this.branchesService.createBranch(req.user.tenantId, body);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() body: { name?: string, address?: string, settings?: any }) {
    return this.branchesService.updateBranch(req.user.tenantId, id, body);
  }

  @Post(':id/gateways')
  updateGateways(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.branchesService.updateGateways(req.user.tenantId, id, body);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.branchesService.deleteBranch(req.user.tenantId, id);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query, HttpException, HttpStatus } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { SetPermissions } from '../../common/decorators/permissions.decorator';

@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService
  ) {}

  @Get('cashboxes')
  @SetPermissions('cashbox.view')
  async getCashboxes(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.financeService.getCashboxes(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('cashbox/summary')
  @SetPermissions('cashbox.view')
  async getCashboxSummary(@Req() req: any, @Query() query: any) {
    try {
      return await this.financeService.getCashboxSummary(req.user.tenantId, query.branch_id, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('archive-stats')
  @SetPermissions('analytics.financial', 'cashbox.view')
  async getArchiveStats(@Req() req: any, @Query('branch_id') branchId: string) {
    try {
      return await this.financeService.getArchiveStats(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('cashbox/transfers')
  @SetPermissions('cashbox.view')
  async getTransfers(@Req() req: any, @Query() query: any) {
    try {
      return await this.financeService.getTransfers(req.user.tenantId, query.branch_id, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('cashbox/transfers')
  @SetPermissions('cashbox.transfer')
  async executeTransfer(@Req() req: any, @Body() data: any) {
    try {
      return await this.financeService.executeTransfer(req.user.tenantId, req.user.userId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('cashbox/graph')
  @SetPermissions('analytics.financial')
  async getCashflowGraphData(@Req() req: any, @Query() query: any) {
    try {
      return await this.financeService.getCashflowGraphData(req.user.tenantId, query.branch_id, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('payments')
  @SetPermissions('payments.create')
  async processPayment(@Req() req: any, @Body() data: any) {
    try {
      return await this.financeService.processPayment(req.user.tenantId, { ...data, cashier_id: req.user.userId });
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('payments/stats')
  @SetPermissions('payments.view', 'analytics.financial')
  async getPaymentStats(@Req() req: any, @Query('branch_id') branchId?: string, @Query('period') period?: string, @Query() query?: any) {
    try {
      return await this.financeService.getPaymentStats(req.user.tenantId, branchId, period, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('invoices/unpaid/:studentId')
  @SetPermissions('payments.view')
  async getUnpaidInvoices(@Req() req: any, @Param('studentId') studentId: string) {
    try {
      return await this.financeService.getUnpaidInvoices(req.user.tenantId, studentId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('transactions')
  @SetPermissions('payments.view')
  async getTransactions(@Req() req: any, @Query() query: any) {
    try {
      return await this.financeService.getTransactions(req.user.tenantId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('debtors')
  @SetPermissions('callcenter.debtors', 'analytics.financial')
  async getDebtors(@Req() req: any, @Query() query: any) {
    try {
      return await this.financeService.getDebtors(req.user.tenantId, query.branch_id, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('debtors/:studentId/debts')
  @SetPermissions('payments.delete')
  async clearStudentDebts(@Req() req: any, @Param('studentId') studentId: string) {
    try {
      return await this.financeService.clearStudentDebts(req.user.tenantId, studentId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('expenses')
  @SetPermissions('expenses.create')
  async recordExpense(@Req() req: any, @Body() data: any) {
    try {
      return await this.financeService.recordExpense(req.user.tenantId, { ...data, userId: req.user.userId });
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('expenses')
  @SetPermissions('expenses.view')
  async getExpenses(@Req() req: any, @Query() query: any) {
    try {
      return await this.financeService.getExpenses(req.user.tenantId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('expenses/:id/archive')
  @SetPermissions('expenses.delete')
  async archiveExpense(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    try {
      return await this.financeService.archiveExpense(req.user.tenantId, id, reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('expenses/:id/restore')
  @SetPermissions('expenses.delete')
  async restoreExpense(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.restoreExpense(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('expenses/:id')
  @SetPermissions('expenses.delete')
  async deleteExpense(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.deleteExpense(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('payrolls')
  @SetPermissions('salaries.calculate')
  async generatePayroll(@Req() req: any, @Body() data: any) {
    try {
      return await this.financeService.generatePayroll(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('payrolls/:id/process')
  @SetPermissions('salaries.pay')
  async processPayroll(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    try {
      return await this.financeService.processPayroll(req.user.tenantId, id, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('payrolls')
  @SetPermissions('salaries.view')
  async getPayrolls(@Req() req: any, @Query() query: any) {
    try {
      return await this.financeService.getPayrolls(req.user.tenantId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('payrolls/:id/archive')
  @SetPermissions('salaries.calculate')
  async archivePayroll(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    try {
      return await this.financeService.archivePayroll(req.user.tenantId, id, reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('payrolls/:id/restore')
  @SetPermissions('salaries.calculate')
  async restorePayroll(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.restorePayroll(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('payrolls/:id')
  @SetPermissions('salaries.calculate')
  async deletePayroll(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.deletePayroll(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('discounts')
  @SetPermissions('discounts.view')
  async getDiscounts(@Req() req: any) {
    try {
      return await this.financeService.getDiscounts(req.user.tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('sales')
  @SetPermissions('incomes.view')
  async getSales(@Req() req: any, @Query() query: any) {
    try {
      return await this.financeService.getSales(req.user.tenantId, query.branch_id, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('sales')
  @SetPermissions('incomes.create')
  async recordSale(@Req() req: any, @Body() body: any) {
    try {
      return await this.financeService.recordSale(req.user.tenantId, { ...body, staff_id: req.user.userId });
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('sales/:id/archive')
  @SetPermissions('incomes.delete')
  async archiveSale(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    try {
      return await this.financeService.archiveSale(req.user.tenantId, id, reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('sales/:id/restore')
  @SetPermissions('incomes.delete')
  async restoreSale(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.restoreSale(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('sales/:id')
  @SetPermissions('incomes.delete')
  async deleteSale(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.deleteSale(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Payments Archive Endpoints
  @Put('payments/:id/change-method')
  @SetPermissions('payments.create', 'payments.delete')
  async changePaymentMethod(@Req() req: any, @Param('id') id: string, @Body() data: { type: string, reason?: string }) {
    try {
      return await this.financeService.changePaymentMethod(req.user.tenantId, id, data.type, data.reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('payments/:id/archive')
  @SetPermissions('payments.delete')
  async archivePayment(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    try {
      return await this.financeService.archivePayment(req.user.tenantId, id, reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('payments/:id/restore')
  @SetPermissions('payments.delete')
  async restorePayment(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.restorePayment(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('payments/:id')
  @SetPermissions('payments.delete')
  async deletePayment(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.deletePayment(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // --- BONUSES ---
  @Get('bonuses')
  @SetPermissions('salaries.view')
  async getBonuses(@Req() req: any, @Query() query: any) {
    try {
      return await this.financeService.getBonuses(req.user.tenantId, query);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bonuses')
  @SetPermissions('salaries.calculate')
  async createBonus(@Req() req: any, @Body() data: any) {
    try {
      return await this.financeService.createBonus(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bonuses/:id/archive')
  @SetPermissions('salaries.calculate')
  async archiveBonus(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    try {
      return await this.financeService.archiveBonus(req.user.tenantId, id, reason);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bonuses/:id/restore')
  @SetPermissions('salaries.calculate')
  async restoreBonus(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.restoreBonus(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('bonuses/:id')
  @SetPermissions('salaries.calculate')
  async deleteBonus(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.deleteBonus(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // --- BONUS SOURCES ---
  @Get('bonus-sources')
  @SetPermissions('salaries.view')
  async getBonusSources(@Req() req: any) {
    try {
      return await this.financeService.getBonusSources(req.user.tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('bonus-sources')
  @SetPermissions('salaries.calculate')
  async createBonusSource(@Req() req: any, @Body() data: any) {
    try {
      return await this.financeService.createBonusSource(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('bonus-sources/:id')
  @SetPermissions('salaries.calculate')
  async deleteBonusSource(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.deleteBonusSource(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // --- EXPENSE CATEGORIES ---
  @Get('expense-categories')
  @SetPermissions('expenses.view')
  async getExpenseCategories(@Req() req: any) {
    try {
      return await this.financeService.getExpenseCategories(req.user.tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('expense-categories')
  @SetPermissions('expenses.create')
  async saveExpenseCategory(@Req() req: any, @Body() data: any) {
    try {
      return await this.financeService.saveExpenseCategory(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('expense-categories/:id')
  @SetPermissions('expenses.delete')
  async deleteExpenseCategory(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.deleteExpenseCategory(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // --- DEPARTMENTS ---
  @Get('departments')
  @SetPermissions('expenses.view')
  async getDepartments(@Req() req: any) {
    try {
      return await this.financeService.getDepartments(req.user.tenantId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('departments')
  @SetPermissions('expenses.create')
  async saveDepartment(@Req() req: any, @Body() data: any) {
    try {
      return await this.financeService.saveDepartment(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('departments/:id')
  @SetPermissions('expenses.delete')
  async deleteDepartment(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.deleteDepartment(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // --- EXPENSE PLANNING ---
  @Get('expense-plans')
  @SetPermissions('expenses.view')
  async getExpensePlans(@Req() req: any, @Query('branch_id') branchId?: string) {
    try {
      return await this.financeService.getExpensePlans(req.user.tenantId, branchId);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('expense-plans')
  @SetPermissions('expenses.create')
  async saveExpensePlan(@Req() req: any, @Body() data: any) {
    try {
      return await this.financeService.saveExpensePlan(req.user.tenantId, data);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('expense-plans/:id')
  @SetPermissions('expenses.delete')
  async deleteExpensePlan(@Req() req: any, @Param('id') id: string) {
    try {
      return await this.financeService.deleteExpensePlan(req.user.tenantId, id);
    } catch (e: any) {
      throw new HttpException({ message: e.message || 'Xatolik yuz berdi' }, e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

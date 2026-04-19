import { Controller, Get, Post, Put, Delete, Body, Param, Req, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService
  ) {}

  @Get('cashboxes')
  getCashboxes(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.financeService.getCashboxes(req.user.tenantId, branchId);
  }

  @Get('cashbox/summary')
  getCashboxSummary(@Req() req: any, @Query() query: any) {
    return this.financeService.getCashboxSummary(req.user.tenantId, query.branch_id, query);
  }

  @Get('archive-stats')
  getArchiveStats(@Req() req: any, @Query('branch_id') branchId: string) {
    return this.financeService.getArchiveStats(req.user.tenantId, branchId);
  }

  @Get('cashbox/transfers')
  getTransfers(@Req() req: any, @Query() query: any) {
    return this.financeService.getTransfers(req.user.tenantId, query.branch_id, query);
  }

  @Post('cashbox/transfers')
  executeTransfer(@Req() req: any, @Body() data: any) {
    return this.financeService.executeTransfer(req.user.tenantId, req.user.userId, data);
  }

  @Get('cashbox/graph')
  getCashflowGraphData(@Req() req: any, @Query() query: any) {
    return this.financeService.getCashflowGraphData(req.user.tenantId, query.branch_id, query);
  }

  @Post('payments')
  processPayment(@Req() req: any, @Body() data: any) {
    return this.financeService.processPayment(req.user.tenantId, { ...data, cashier_id: req.user.userId });
  }

  @Get('payments/stats')
  getPaymentStats(@Req() req: any, @Query('branch_id') branchId?: string, @Query('period') period?: string, @Query() query?: any) {
    return this.financeService.getPaymentStats(req.user.tenantId, branchId, period, query);
  }

  @Get('invoices/unpaid/:studentId')
  getUnpaidInvoices(@Req() req: any, @Param('studentId') studentId: string) {
    return this.financeService.getUnpaidInvoices(req.user.tenantId, studentId);
  }

  @Get('transactions')
  getTransactions(@Req() req: any, @Query() query: any) {
    // Barcha query parametrlarini birga uzatamiz
    return this.financeService.getTransactions(req.user.tenantId, query);
  }

  @Get('debtors')
  getDebtors(@Req() req: any, @Query() query: any) {
    return this.financeService.getDebtors(req.user.tenantId, query.branch_id, query);
  }

  @Post('expenses')
  recordExpense(@Req() req: any, @Body() data: any) {
    return this.financeService.recordExpense(req.user.tenantId, { ...data, userId: req.user.userId });
  }

  @Get('expenses')
  getExpenses(@Req() req: any, @Query() query: any) {
    return this.financeService.getExpenses(req.user.tenantId, query);
  }

  @Post('expenses/:id/archive')
  archiveExpense(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.financeService.archiveExpense(req.user.tenantId, id, reason);
  }

  @Post('expenses/:id/restore')
  restoreExpense(@Req() req: any, @Param('id') id: string) {
    return this.financeService.restoreExpense(req.user.tenantId, id);
  }

  @Delete('expenses/:id')
  deleteExpense(@Req() req: any, @Param('id') id: string) {
    return this.financeService.deleteExpense(req.user.tenantId, id);
  }

  @Post('payrolls')
  generatePayroll(@Req() req: any, @Body() data: any) {
    return this.financeService.generatePayroll(req.user.tenantId, data);
  }

  @Put('payrolls/:id/process')
  processPayroll(@Req() req: any, @Param('id') id: string, @Body() data: any) {
    return this.financeService.processPayroll(req.user.tenantId, id, data);
  }

  @Get('payrolls')
  getPayrolls(@Req() req: any, @Query() query: any) {
    return this.financeService.getPayrolls(req.user.tenantId, query);
  }

  @Post('payrolls/:id/archive')
  archivePayroll(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.financeService.archivePayroll(req.user.tenantId, id, reason);
  }

  @Post('payrolls/:id/restore')
  restorePayroll(@Req() req: any, @Param('id') id: string) {
    return this.financeService.restorePayroll(req.user.tenantId, id);
  }

  @Delete('payrolls/:id')
  deletePayroll(@Req() req: any, @Param('id') id: string) {
    return this.financeService.deletePayroll(req.user.tenantId, id);
  }

  @Get('discounts')
  getDiscounts(@Req() req: any) {
    return this.financeService.getDiscounts(req.user.tenantId);
  }

  @Get('sales')
  getSales(@Req() req: any, @Query() query: any) {
    return this.financeService.getSales(req.user.tenantId, query.branch_id, query);
  }

  @Post('sales')
  recordSale(@Req() req: any, @Body() body: any) {
    return this.financeService.recordSale(req.user.tenantId, { ...body, staff_id: req.user.userId });
  }

  @Post('sales/:id/archive')
  archiveSale(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.financeService.archiveSale(req.user.tenantId, id, reason);
  }

  @Post('sales/:id/restore')
  restoreSale(@Req() req: any, @Param('id') id: string) {
    return this.financeService.restoreSale(req.user.tenantId, id);
  }

  // Payments Archive Endpoints
  @Post('payments/:id/archive')
  archivePayment(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.financeService.archivePayment(req.user.tenantId, id, reason);
  }

  @Post('payments/:id/restore')
  restorePayment(@Req() req: any, @Param('id') id: string) {
    return this.financeService.restorePayment(req.user.tenantId, id);
  }

  @Delete('payments/:id')
  deletePayment(@Req() req: any, @Param('id') id: string) {
    return this.financeService.deletePayment(req.user.tenantId, id);
  }

  // --- BONUSES ---
  @Get('bonuses')
  getBonuses(@Req() req: any, @Query() query: any) {
    return this.financeService.getBonuses(req.user.tenantId, query);
  }

  @Post('bonuses')
  createBonus(@Req() req: any, @Body() data: any) {
    return this.financeService.createBonus(req.user.tenantId, data);
  }

  @Post('bonuses/:id/archive')
  archiveBonus(@Req() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.financeService.archiveBonus(req.user.tenantId, id, reason);
  }

  @Post('bonuses/:id/restore')
  restoreBonus(@Req() req: any, @Param('id') id: string) {
    return this.financeService.restoreBonus(req.user.tenantId, id);
  }

  @Delete('bonuses/:id')
  deleteBonus(@Req() req: any, @Param('id') id: string) {
    return this.financeService.deleteBonus(req.user.tenantId, id);
  }

  // --- BONUS SOURCES ---
  @Get('bonus-sources')
  getBonusSources(@Req() req: any) {
    return this.financeService.getBonusSources(req.user.tenantId);
  }

  @Post('bonus-sources')
  createBonusSource(@Req() req: any, @Body() data: any) {
    return this.financeService.createBonusSource(req.user.tenantId, data);
  }

  @Delete('bonus-sources/:id')
  deleteBonusSource(@Req() req: any, @Param('id') id: string) {
    return this.financeService.deleteBonusSource(req.user.tenantId, id);
  }

  // --- EXPENSE CATEGORIES ---
  @Get('expense-categories')
  getExpenseCategories(@Req() req: any) {
    return this.financeService.getExpenseCategories(req.user.tenantId);
  }

  @Post('expense-categories')
  saveExpenseCategory(@Req() req: any, @Body() data: any) {
    return this.financeService.saveExpenseCategory(req.user.tenantId, data);
  }

  @Delete('expense-categories/:id')
  deleteExpenseCategory(@Req() req: any, @Param('id') id: string) {
    return this.financeService.deleteExpenseCategory(req.user.tenantId, id);
  }

  // --- DEPARTMENTS ---
  @Get('departments')
  getDepartments(@Req() req: any) {
    return this.financeService.getDepartments(req.user.tenantId);
  }

  @Post('departments')
  saveDepartment(@Req() req: any, @Body() data: any) {
    return this.financeService.saveDepartment(req.user.tenantId, data);
  }

  @Delete('departments/:id')
  deleteDepartment(@Req() req: any, @Param('id') id: string) {
    return this.financeService.deleteDepartment(req.user.tenantId, id);
  }

  // --- EXPENSE PLANNING ---
  @Get('expense-plans')
  getExpensePlans(@Req() req: any, @Query('branch_id') branchId?: string) {
    return this.financeService.getExpensePlans(req.user.tenantId, branchId);
  }

  @Post('expense-plans')
  saveExpensePlan(@Req() req: any, @Body() data: any) {
    return this.financeService.saveExpensePlan(req.user.tenantId, data);
  }

  @Delete('expense-plans/:id')
  deleteExpensePlan(@Req() req: any, @Param('id') id: string) {
    return this.financeService.deleteExpensePlan(req.user.tenantId, id);
  }
}

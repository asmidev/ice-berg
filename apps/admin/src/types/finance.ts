export type PayrollStatus = 'PENDING' | 'PAID' | 'ARCHIVED';
export type SalaryType = 'FIXED' | 'KPI' | 'HOURLY';
export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

export interface User {
  first_name: string;
  last_name: string;
}

export interface Employee {
  id: string;
  user: User;
}

export interface Cashbox {
  id: string;
  name: string;
  balance: number;
}

export interface Payroll {
  id: string;
  teacher_id?: string;
  staff_id?: string;
  teacher?: Employee;
  staff?: Employee;
  amount: number;
  bonus: number;
  deduction: number;
  period: string;
  type: SalaryType;
  description: string;
  status: PayrollStatus;
  payment_method?: PaymentMethod;
  cashbox_id?: string;
  cashbox?: Cashbox;
  created_at: string;
  updated_at: string;
}

export interface PayrollFilters {
  search: string;
  startDate: string;
  endDate: string;
  type: string;
}

export interface AddSalaryFormData {
  employee_id: string;
  employee_type: 'TEACHER' | 'STAFF';
  amount: string;
  deduction: string;
  period: string;
  type: SalaryType;
  description: string;
}

export interface PaySalaryFormData {
  id: string;
  cashbox_id: string;
  method: PaymentMethod;
}

export interface ArchiveSalaryFormData {
  id: string;
  reason: string;
}

export interface BonusSource {
  id: string;
  name: string;
}

export interface Bonus {
  id: string;
  teacher_id?: string;
  staff_id?: string;
  teacher?: Employee;
  staff?: Employee;
  amount: number;
  reason: string;
  source_id: string;
  source?: BonusSource;
  cashbox_id: string;
  cashbox?: Cashbox;
  payment_method: PaymentMethod;
  date: string;
  created_at: string;
}

export interface AddBonusFormData {
  employee_id: string;
  employee_type: 'TEACHER' | 'STAFF';
  amount: string;
  reason: string;
  source_id: string;
  cashbox_id: string;
  method: PaymentMethod;
  date: string;
}

export interface BonusFilters {
  search: string;
  startDate: string;
  endDate: string;
  source_id: string;
}

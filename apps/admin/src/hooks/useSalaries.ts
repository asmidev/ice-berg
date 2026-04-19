import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { 
  Payroll, Employee, Cashbox, PayrollFilters, 
  AddSalaryFormData, PaySalaryFormData, ArchiveSalaryFormData 
} from '@/types/finance';

export const useSalaries = (branchId: string, filters: PayrollFilters) => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [teachers, setTeachers] = useState<Employee[]>([]);
  const [staff, setStaff] = useState<Employee[]>([]);
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      let path = `/finance/payrolls?branch_id=${branchId}&search=${filters.search}&startDate=${filters.startDate}&endDate=${filters.endDate}`;
      if (filters.type !== 'all') path += `&type=${filters.type}`;

      const [payrollsRes, teachersRes, staffRes, cashboxesRes] = await Promise.all([
        api.get(path),
        api.get(`/lms/teachers?branch_id=${branchId}`),
        api.get(`/staff?branch_id=${branchId}`),
        api.get(`/finance/cashboxes?branch_id=${branchId}`)
      ]);

      setPayrolls(payrollsRes.data?.data || payrollsRes.data || []);
      setTeachers(teachersRes.data?.data || teachersRes.data || []);
      setStaff(staffRes.data?.data || staffRes.data || []);
      setCashboxes(cashboxesRes.data?.data || cashboxesRes.data || []);
    } catch (err) {
      console.error('useSalaries Fetch Error', err);
    } finally {
      setLoading(false);
    }
  }, [branchId, filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 500);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  // Actions
  const createSalary = async (data: AddSalaryFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        branch_id: branchId === 'all' ? undefined : branchId,
        teacher_id: data.employee_type === 'TEACHER' ? data.employee_id : undefined,
        staff_id: data.employee_type === 'STAFF' ? data.employee_id : undefined,
        amount: Number(data.amount),
        bonus: 0,
        deduction: Number(data.deduction),
        period: data.period,
        type: data.type,
        description: data.description
      };
      await api.post('/finance/payrolls', payload);
      await fetchData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Xatolik yuz berdi" };
    } finally {
      setSubmitting(false);
    }
  };

  const processPay = async (data: PaySalaryFormData) => {
    setSubmitting(true);
    try {
      await api.put(`/finance/payrolls/${data.id}/process`, {
        cashbox_id: data.cashbox_id,
        payment_method: data.method
      });
      await fetchData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Xatolik yuz berdi" };
    } finally {
      setSubmitting(false);
    }
  };

  const archiveSalary = async (data: ArchiveSalaryFormData) => {
    setSubmitting(true);
    try {
      await api.post(`/finance/payrolls/${data.id}/archive`, { reason: data.reason });
      await fetchData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Xatolik yuz berdi" };
    } finally {
      setSubmitting(false);
    }
  };

  const totalPaidAmount = useMemo(() => {
    return payrolls.reduce((sum, p) => sum + (p.status === 'PAID' ? Number(p.amount) + Number(p.bonus) - Number(p.deduction) : 0), 0);
  }, [payrolls]);

  return {
    payrolls,
    teachers,
    staff,
    cashboxes,
    loading,
    submitting,
    totalPaidAmount,
    refresh: fetchData,
    createSalary,
    processPay,
    archiveSalary
  };
};

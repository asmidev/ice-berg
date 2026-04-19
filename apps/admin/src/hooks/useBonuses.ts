import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { 
  Bonus, BonusSource, Employee, Cashbox, BonusFilters, 
  AddBonusFormData 
} from '@/types/finance';

export const useBonuses = (branchId: string, filters: BonusFilters) => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [teachers, setTeachers] = useState<Employee[]>([]);
  const [staff, setStaff] = useState<Employee[]>([]);
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [sources, setSources] = useState<BonusSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const currentBranch = branchId;
      let path = `/finance/bonuses?branch_id=${currentBranch}&search=${filters.search}&startDate=${filters.startDate}&endDate=${filters.endDate}`;
      if (filters.source_id !== 'all') path += `&source_id=${filters.source_id}`;

      const [bonusesRes, teachersRes, staffRes, cashboxesRes, sourcesRes] = await Promise.all([
        api.get(path),
        api.get(`/lms/teachers?branch_id=${currentBranch}`),
        api.get(`/staff?branch_id=${currentBranch}`),
        api.get(`/finance/cashboxes?branch_id=${currentBranch}`),
        api.get(`/finance/bonus-sources`)
      ]);

      setBonuses(bonusesRes.data?.data || bonusesRes.data || []);
      setTeachers(teachersRes.data?.data || teachersRes.data || []);
      setStaff(staffRes.data?.data || staffRes.data || []);
      setCashboxes(cashboxesRes.data?.data || cashboxesRes.data || []);
      setSources(sourcesRes.data?.data || sourcesRes.data || []);
    } catch (err) {
      console.error('useBonuses Fetch Error', err);
    } finally {
      setLoading(false);
    }
  }, [branchId, filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchData, 500);
    return () => clearTimeout(timeout);
  }, [fetchData]);

  const createBonus = async (data: AddBonusFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        branch_id: branchId === 'all' ? undefined : branchId,
        teacher_id: data.employee_type === 'TEACHER' ? data.employee_id : undefined,
        staff_id: data.employee_type === 'STAFF' ? data.employee_id : undefined,
        amount: Number(data.amount),
        reason: data.reason,
        source_id: data.source_id,
        cashbox_id: data.cashbox_id,
        payment_method: data.method,
        date: data.date
      };
      await api.post('/finance/bonuses', payload);
      await fetchData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Xatolik yuz berdi" };
    } finally {
      setSubmitting(false);
    }
  };

  const createSource = async (name: string) => {
    setSubmitting(true);
    try {
      await api.post('/finance/bonus-sources', { name });
      const sourcesRes = await api.get('/finance/bonus-sources');
      setSources(sourcesRes.data?.data || sourcesRes.data || []);
      return { success: true };
    } catch (err) {
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSource = async (id: string) => {
    try {
      await api.delete(`/finance/bonus-sources/${id}`);
      setSources(prev => prev.filter(s => s.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  const archiveBonus = async (id: string, reason: string) => {
    setSubmitting(true);
    try {
      await api.post(`/finance/bonuses/${id}/archive`, { reason });
      await fetchData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Xatolik yuz berdi" };
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = useMemo(() => {
    return bonuses.reduce((sum, b) => sum + Number(b.amount), 0);
  }, [bonuses]);

  return {
    bonuses, teachers, staff, cashboxes, sources,
    loading, submitting, totalAmount,
    createBonus, createSource, deleteSource, archiveBonus,
    refresh: fetchData
  };
};

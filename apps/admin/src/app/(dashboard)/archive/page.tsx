"use client";

import { useEffect, useState, useMemo } from "react";
import { useBranch } from "@/providers/BranchProvider";
import api from "@/lib/api";
import { 
  Users, Briefcase, GraduationCap, BookOpen, UserCog, 
  Search, RotateCcw, Trash2, Filter, X, 
  AlertCircle, CheckCircle2, MoreVertical, 
  History, Mail, Calendar, ChevronDown, Download,
  Square, CheckSquare, AlertTriangle, CreditCard,
  ArrowRightLeft, Wallet, Loader2, Archive
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import CustomPagination from "@/components/ui/custom-pagination";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

// --- Types ---
type ArchiveTab = "crm" | "students" | "teachers" | "staff" | "groups" | "finance";
type FinanceSubTab = "payments" | "expenses" | "incomes" | "salaries" | "bonuses";

interface StatCardProps {
  title: string;
  value: string | number;
  gradient: 1 | 2 | 3 | 4;
  icon: any;
  trend?: string;
  subtitle?: string;
  loading?: boolean;
}

// --- Icons Mapping ---
const TabIcons = {
  crm: Briefcase,
  students: GraduationCap,
  teachers: Users,
  staff: UserCog,
  groups: BookOpen,
  finance: CreditCard,
};

const FinanceIcons = {
  payments: CreditCard,
  expenses: Download,
  incomes: ArrowRightLeft,
  salaries: Wallet,
  bonuses: History,
};

// --- Stat Card Component (Premium Gradient) ---
const ArchiveStatCard = ({ title, value, gradient, icon: Icon, trend, subtitle, loading }: StatCardProps) => {
  const gradients = {
    1: "from-[#ec4899] to-[#be185d]", // Pink
    2: "from-[#06b6d4] to-[#0284c7]", // Cyan
    3: "from-[#1e3a5f] to-[#0f172a]", // Navy
    4: "from-[#8b5cf6] to-[#6d28d9]", // Purple
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-none shadow-lg h-32 rounded-2xl transition-all hover:scale-[1.02]",
      "bg-gradient-to-br", gradients[gradient]
    )}>
      <CardContent className="p-5 flex flex-col h-full justify-between text-white relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest">{title}</span>
            <span className="text-2xl font-black mt-1">
              {loading ? <div className="h-8 w-16 bg-white/20 animate-pulse rounded-md" /> : value}
            </span>
          </div>
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <Icon size={20} className="text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2">
           {trend && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">{trend}</span>}
           {subtitle && <span className="text-white/60 text-[10px] font-medium tracking-tight uppercase">{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default function UnifiedArchivePage() {
  const { branchId } = useBranch();
  const [activeTab, setActiveTab] = useState<ArchiveTab>("crm");
  const [financeSubTab, setFinanceSubTab] = useState<FinanceSubTab>("payments");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<any>({});

  // Dialog States
  const [confirmDialog, setConfirmDialog] = useState<{ 
    isOpen: boolean; 
    type: "restore" | "delete"; 
    id: string; 
    name: string;
    subEntity?: string;
  } | null>(null);

  // --- Effects ---
  useEffect(() => {
    fetchData();
  }, [branchId, activeTab, financeSubTab, page, search, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let statsEndpoint = "";
      let query = `?branch_id=${branchId}&page=${page}&search=${search}&is_archived=true`;

      switch (activeTab) {
        case "crm":
          endpoint = "/crm/leads";
          statsEndpoint = "/crm/archive-stats";
          query += "&status=ARCHIVED";
          break;
        case "students":
          endpoint = "/students";
          statsEndpoint = "/students/archive-stats";
          break;
        case "teachers":
          endpoint = "/teachers";
          statsEndpoint = "/teachers/archive-stats";
          break;
        case "staff":
          endpoint = "/staff";
          statsEndpoint = "/staff/archive-stats";
          break;
        case "groups":
          endpoint = "/lms/groups/archived";
          statsEndpoint = "/lms/archive-stats";
          query = `?branch_id=${branchId}&page=${page}&search=${search}`; // Groups use different structured list
          break;
        case "finance":
          statsEndpoint = "/finance/archive-stats";
          switch(financeSubTab) {
            case "payments": endpoint = "/finance/transactions"; break;
            case "expenses": endpoint = "/finance/expenses"; break;
            case "incomes": endpoint = "/finance/sales"; break;
            case "salaries": endpoint = "/finance/payrolls"; break;
            case "bonuses": endpoint = "/finance/bonuses"; break;
          }
          break;
      }

      const [dataRes, statsRes] = await Promise.allSettled([
        api.get(`${endpoint}${query}`),
        statsEndpoint ? api.get(`${statsEndpoint}?branch_id=${branchId}`) : Promise.reject()
      ]);

      if (dataRes.status === "fulfilled") {
        const result = dataRes.value.data?.data || dataRes.value.data || [];
        setData(Array.isArray(result) ? result : (result.data || []));
        setTotalPages(dataRes.value.data?.meta?.totalPages || 1);
      }

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data?.data || statsRes.value.data || {});
      } else {
        setStats({});
      }

    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!confirmDialog) return;
    try {
      const { type, id } = confirmDialog;
      let path = "";
      let method: 'put' | 'post' | 'delete' = type === 'delete' ? 'delete' : 'put';
      
      switch (activeTab) {
         case "crm": path = `/crm/leads/${id}${type === 'restore' ? '/restore' : ''}`; break;
         case "students": path = `/students/${id}${type === 'restore' ? '/restore' : ''}`; break;
         case "teachers": path = `/teachers/${id}${type === 'restore' ? '/restore' : ''}`; break;
         case "staff": 
            path = `/staff/${id}/${type === 'restore' ? 'restore' : 'archive'}`; 
            break;
         case "groups": 
            path = `/lms/groups/${id}${type === 'restore' ? '/restore' : ''}`; 
            if (type === 'restore') method = 'post';
            break;
         case "finance":
            method = type === 'delete' ? 'delete' : 'post'; // Finance always uses POST for restore
            switch(financeSubTab) {
              case "payments": path = `/finance/payments/${id}${type === 'restore' ? '/restore' : ''}`; break;
              case "expenses": path = `/finance/expenses/${id}${type === 'restore' ? '/restore' : ''}`; break;
              case "incomes": path = `/finance/sales/${id}${type === 'restore' ? '/restore' : ''}`; break;
              case "salaries": path = `/finance/payrolls/${id}${type === 'restore' ? '/restore' : ''}`; break;
              case "bonuses": path = `/finance/bonuses/${id}${type === 'restore' ? '/restore' : ''}`; break;
            }
            break;
      }

      if (method === 'delete') await api.delete(path);
      else if (method === 'post') await api.post(path);
      else await api.put(path);

      toast.success(type === 'restore' ? "Muvaffaqiyatli tiklandi" : "Muvaffaqiyatli o'chirildi");
      setConfirmDialog(null);
      fetchData();
    } catch (err) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      toast.error("Eksport qilish uchun ma'lumotlar mavjud emas");
      return;
    }

    let formattedData: any[] = [];
    let fileName = "";
    let sheetName = "";

    switch (activeTab) {
      case "crm":
        formattedData = data.map((item, i) => ({
          "T/r": i + 1,
          "F.I.SH": item.name,
          "Telefon": item.phone,
          "Kurs": item.source?.name || "-",
          "Sabab": item.archive_reason || "-",
          "Sana": new Date(item.created_at).toLocaleDateString()
        }));
        fileName = "CRM_Arxiv";
        sheetName = "CRM";
        break;
      case "students":
        formattedData = data.map((item, i) => ({
          "T/r": i + 1,
          "Talaba": `${item.user?.first_name || ""} ${item.user?.last_name || ""}`,
          "Telefon": item.user?.phone || "-",
          "Guruh": item.enrollments?.[0]?.group?.name || "-",
          "Arxiv sababi": item.archive_reason || "-",
          "Sana": item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "-"
        }));
        fileName = "Talabalar_Arxiv";
        sheetName = "Talabalar";
        break;
      case "teachers":
        formattedData = data.map((item, i) => ({
          "T/r": i + 1,
          "O'qituvchi": `${item.user?.first_name || ""} ${item.user?.last_name || ""}`,
          "Telefon": item.user?.phone || "-",
          "Maosh": Number(item.salary_amount).toLocaleString() + " so'm",
          "Arxiv sababi": item.archive_reason || "-",
          "Sana": item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "-"
        }));
        fileName = "Oqituvchilar_Arxiv";
        sheetName = "Oqituvchilar";
        break;
      case "staff":
        formattedData = data.map((item, i) => ({
          "T/r": i + 1,
          "Xodim": `${item.first_name || ""} ${item.last_name || ""}`,
          "Telefon": item.phone || "-",
          "Lavozim": item.role?.name || "-",
          "Arxiv sababi": item.archive_reason || "-",
          "Sana": item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "-"
        }));
        fileName = "Xodimlar_Arxiv";
        sheetName = "Xodimlar";
        break;
      case "groups":
        formattedData = data.map((item, i) => ({
          "T/r": i + 1,
          "Guruh": item.name,
          "Kurs": item.course?.name || "-",
          "O'qituvchi": `${item.teacher?.user?.first_name || ""} ${item.teacher?.user?.last_name || ""}`,
          "O'quvchilar soni": item._count?.enrollments || 0,
          "Arxiv sababi": item.archive_reason || "-",
          "Sana": item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "-"
        }));
        fileName = "Guruhlar_Arxiv";
        sheetName = "Guruhlar";
        break;
      case "finance":
        switch(financeSubTab) {
          case "payments":
            formattedData = data.map((item, i) => ({
              "T/r": i + 1,
              "Sana": new Date(item.created_at).toLocaleDateString(),
              "Talaba": `${item.student?.user?.first_name || ""} ${item.student?.user?.last_name || ""}`,
              "Miqdor": Number(item.amount),
              "Usul": item.type,
              "Guruh": item.group?.name || "-",
              "Sabab": item.archive_reason || "-",
              "Arxivlangan": item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "-"
            }));
            fileName = "Tolovlar_Arxiv";
            sheetName = "To'lovlar";
            break;
          case "expenses":
            formattedData = data.map((item, i) => ({
              "T/r": i + 1,
              "Sana": new Date(item.date || item.created_at).toLocaleDateString(),
              "Tavsif": item.description,
              "Kategoriya": item.categoryRel?.name || item.category,
              "Miqdor": Number(item.amount),
              "Mas'ul": item.staff?.first_name || "-",
              "Sabab": item.archive_reason || "-",
              "Arxivlangan": item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "-"
            }));
            fileName = "Xarajatlar_Arxiv";
            sheetName = "Xarajatlar";
            break;
          case "incomes":
            formattedData = data.map((item, i) => ({
              "T/r": i + 1,
              "Sana": new Date(item.date || item.created_at).toLocaleDateString(),
              "Tavsif": item.description,
              "Mijoz": item.customer_name || "-",
              "Miqdor": Number(item.amount),
              "Kategoriya": item.categoryRel?.name || "-",
              "Sabab": item.archive_reason || "-",
              "Arxivlangan": item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "-"
            }));
            fileName = "Daromadlar_Arxiv";
            sheetName = "Daromadlar";
            break;
          case "salaries":
            formattedData = data.map((item, i) => ({
              "T/r": i + 1,
              "Xodim": `${item.staff?.first_name || ""} ${item.staff?.last_name || ""}`,
              "Oy/Yil": `${item.month}/${item.year}`,
              "Asosiy maosh": Number(item.base_salary),
              "Bonus": Number(item.bonus_amount),
              "Jarima": Number(item.penalty_amount),
              "Jami": Number(item.total_amount),
              "Sabab": item.archive_reason || "-",
              "Arxivlangan": item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "-"
            }));
            fileName = "Maoshlar_Arxiv";
            sheetName = "Maoshlar";
            break;
          case "bonuses":
            formattedData = data.map((item, i) => ({
              "T/r": i + 1,
              "Xodim": `${item.staff?.first_name || ""} ${item.staff?.last_name || ""}`,
              "Miqdor": Number(item.amount),
              "Tavsif": item.description,
              "Sana": new Date(item.date || item.created_at).toLocaleDateString(),
              "Sabab": item.archive_reason || "-",
              "Arxivlangan": item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "-"
            }));
            fileName = "Bonuslar_Arxiv";
            sheetName = "Bonuslar";
            break;
        }
        break;
    }

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- Render Functions ---
  const renderCrmTable = () => (
    <table className="w-full text-left">
      <thead className="bg-zinc-50 border-b border-zinc-100">
        <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <th className="py-4 pl-8">FISH</th>
          <th className="py-4 px-4">Telefon</th>
          <th className="py-4 px-4">Kurs</th>
          <th className="py-4 px-4">Sabab</th>
          <th className="py-4 px-4">O'chirilgan sana</th>
          <th className="py-4 pr-8 text-right">Amallar</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-50 font-medium text-[13px] text-zinc-600">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
            <td className="py-4 pl-8 font-bold text-zinc-900">{item.name}</td>
            <td className="py-4 px-4 font-mono text-[12px]">{item.phone}</td>
            <td className="py-4 px-4">{item.source?.name || "—"}</td>
            <td className="py-4 px-4"><span className="text-rose-500 font-bold text-[11px] uppercase">{item.archive_reason}</span></td>
            <td className="py-4 px-4 text-zinc-400">{new Date(item.created_at).toLocaleDateString()}</td>
            <td className="py-4 pr-8 text-right">
              <div className="flex justify-end gap-2 text-zinc-400 hover:text-zinc-600">
                <button onClick={() => setConfirmDialog({ isOpen: true, type: 'restore', id: item.id, name: item.name })} className="p-1 hover:text-emerald-500 transition-colors"><RotateCcw size={16} /></button>
                <button onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', id: item.id, name: item.name })} className="p-1 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderStudentsTable = () => (
    <table className="w-full text-left">
      <thead className="bg-zinc-50 border-b border-zinc-100">
        <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <th className="py-4 pl-8">Talaba</th>
          <th className="py-4 px-4">Telefon</th>
          <th className="py-4 px-4">Guruh</th>
          <th className="py-4 px-4">O'chirilgan sana</th>
          <th className="py-4 pr-8 text-right">Amallar</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-50 font-medium text-[13px] text-zinc-600">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
            <td className="py-4 pl-8">
               <div className="flex flex-col">
                  <span className="font-bold text-zinc-900 leading-tight">{item.user?.first_name} {item.user?.last_name}</span>
                  <span className="text-[11px] text-zinc-400 font-mono">ID: {item.id.slice(-6)}</span>
               </div>
            </td>
            <td className="py-4 px-4 font-mono text-[12px]">{item.user?.phone}</td>
            <td className="py-4 px-4">{item.enrollments?.[0]?.group?.name || "—"}</td>
            <td className="py-4 px-4 text-zinc-400">{item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "—"}</td>
            <td className="py-4 pr-8 text-right">
              <div className="flex justify-end gap-2 text-zinc-400 hover:text-zinc-600">
                <button onClick={() => setConfirmDialog({ isOpen: true, type: 'restore', id: item.id, name: item.user?.first_name })} className="p-1 hover:text-emerald-500 transition-colors"><RotateCcw size={16} /></button>
                <button onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', id: item.id, name: item.user?.first_name })} className="p-1 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTeachersTable = () => (
    <table className="w-full text-left">
      <thead className="bg-zinc-50 border-b border-zinc-100">
        <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <th className="py-4 pl-8">O'qituvchi</th>
          <th className="py-4 px-4">Telefon</th>
          <th className="py-4 px-4">Maosh</th>
          <th className="py-4 px-4">O'chirilgan sana</th>
          <th className="py-4 pr-8 text-right">Amallar</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-50 font-medium text-[13px] text-zinc-600">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
            <td className="py-4 pl-8">
               <div className="flex flex-col">
                  <span className="font-bold text-zinc-900 leading-tight">{item.user?.first_name} {item.user?.last_name}</span>
                  <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest">{item.user?.role?.name || "Teacher"}</span>
               </div>
            </td>
            <td className="py-4 px-4 font-mono text-[12px]">{item.user?.phone}</td>
            <td className="py-4 px-4 font-bold text-zinc-700">{Number(item.salary_amount).toLocaleString()} so'm</td>
            <td className="py-4 px-4 text-zinc-400">{item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "—"}</td>
            <td className="py-4 pr-8 text-right">
              <div className="flex justify-end gap-2 text-zinc-400 hover:text-zinc-600">
                <button onClick={() => setConfirmDialog({ isOpen: true, type: 'restore', id: item.id, name: item.user?.first_name })} className="p-1 hover:text-emerald-500 transition-colors"><RotateCcw size={16} /></button>
                <button onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', id: item.id, name: item.user?.first_name })} className="p-1 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderStaffTable = () => (
    <table className="w-full text-left">
      <thead className="bg-zinc-50 border-b border-zinc-100">
        <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <th className="py-4 pl-8">Xodim</th>
          <th className="py-4 px-4">Telefon</th>
          <th className="py-4 px-4">Lavozim</th>
          <th className="py-4 px-4">Filiallar</th>
          <th className="py-4 px-4">Holati</th>
          <th className="py-4 pr-8 text-right">Amallar</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-50 font-medium text-[13px] text-zinc-600">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
            <td className="py-4 pl-8">
               <div className="flex flex-col">
                  <span className="font-bold text-zinc-900 leading-tight">{item.first_name} {item.last_name}</span>
                  <span className="text-[11px] text-zinc-400 font-mono">ID: {item.id.slice(-6)}</span>
               </div>
            </td>
            <td className="py-4 px-4 font-mono">{item.phone}</td>
            <td className="py-4 px-4">
               <span className="px-2 py-0.5 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-500 uppercase">{item.role?.name || "Rol qayd etilmadi"}</span>
            </td>
            <td className="py-4 px-4 max-w-[150px] truncate text-zinc-400 text-[11px]">{item.branches?.map((b:any) => b.name).join(', ')}</td>
            <td className="py-4 px-4">
               <span className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                  item.staffProfile?.is_archived ? "bg-red-50 border border-red-100 text-red-600" : "bg-emerald-50 border border-emerald-100 text-emerald-600"
               )}>
                  {item.staffProfile?.is_archived ? "Arxivlandi" : "Aktiv"}
               </span>
            </td>
            <td className="py-4 pr-8 text-right">
              <div className="flex justify-end gap-2 text-zinc-400 hover:text-zinc-600">
                <button onClick={() => setConfirmDialog({ isOpen: true, type: 'restore', id: item.id, name: item.first_name })} className="p-1 hover:text-emerald-500 transition-colors"><RotateCcw size={16} /></button>
                <button onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', id: item.id, name: item.first_name })} className="p-1 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderGroupsTable = () => (
    <table className="w-full text-left">
      <thead className="bg-zinc-50 border-b border-zinc-100">
        <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <th className="py-4 pl-8">Guruh</th>
          <th className="py-4 px-4">Kurs</th>
          <th className="py-4 px-4">O'qituvchi</th>
          <th className="py-4 px-4">Vaqti</th>
          <th className="py-4 px-4">O'chirilgan sana</th>
          <th className="py-4 pr-8 text-right">Amallar</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-50 font-medium text-[13px] text-zinc-600">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
            <td className="py-4 pl-8">
               <div className="flex flex-col">
                  <span className="font-bold text-zinc-900 leading-tight">{item.name}</span>
                  <span className="text-[11px] text-emerald-500 font-bold">[{item._count?.enrollments || 0} o'quvchi]</span>
               </div>
            </td>
            <td className="py-4 px-4 text-zinc-500 font-bold">{item.course?.name}</td>
            <td className="py-4 px-4 font-bold text-[#4465aa]">{item.teacher?.user?.first_name} {item.teacher?.user?.last_name?.[0]}.</td>
            <td className="py-4 px-4 font-mono text-[11px]">{item.schedules?.[0]?.start_time} - {item.schedules?.[0]?.end_time}</td>
            <td className="py-4 px-4 text-zinc-400">{item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "—"}</td>
            <td className="py-4 pr-8 text-right">
              <div className="flex justify-end gap-2 text-zinc-400 hover:text-zinc-600">
                <button onClick={() => setConfirmDialog({ isOpen: true, type: 'restore', id: item.id, name: item.name })} className="p-1 hover:text-emerald-500 transition-colors"><RotateCcw size={16} /></button>
                <button onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', id: item.id, name: item.name })} className="p-1 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderFinanceTable = () => {
    const headers: Record<FinanceSubTab, string[]> = {
      payments: ["Sana", "Talaba", "Miqdor", "Usul", "Guruh", "O'chirilgan"],
      expenses: ["Sana", "Tavsif", "Kategoriya", "Miqdor", "Xodim", "O'chirilgan"],
      incomes: ["Sana", "Tavsif", "Mijoz", "Miqdor", "Kategoriya", "O'chirilgan"],
      salaries: ["Xodim", "Oy", "Asosiy", "Bonus/Jarima", "Net", "O'chirilgan"],
      bonuses: ["Xodim", "Miqdor", "Tavsif", "Sana", "O'chirilgan", "Amallar"]
    };

    const currentHeaders = headers[financeSubTab];

    return (
      <table className="w-full text-left">
        <thead className="bg-zinc-50 border-b border-zinc-100">
          <tr className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {currentHeaders.map((h, i) => <th key={i} className={cn("py-4 px-4", i === 0 && "pl-8")}>{h}</th>)}
            <th className="py-4 pr-8 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 font-medium text-[13px] text-zinc-600">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
              {financeSubTab === "payments" && (
                <>
                  <td className="py-4 pl-8">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-4 font-bold text-zinc-900">{item.student?.user?.first_name} {item.student?.user?.last_name?.[0]}.</td>
                  <td className="py-4 px-4 font-bold text-emerald-600">{Number(item.amount).toLocaleString()}</td>
                  <td className="py-4 px-4 text-[11px] uppercase opacity-60">{item.type}</td>
                  <td className="py-4 px-4">{item.group?.name || "—"}</td>
                  <td className="py-4 px-4 text-rose-400">{item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "—"}</td>
                </>
              )}
              {financeSubTab === "expenses" && (
                <>
                  <td className="py-4 pl-8">{new Date(item.date || item.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-4 font-bold text-zinc-900">{item.description}</td>
                  <td className="py-4 px-4 uppercase text-[11px]">{item.categoryRel?.name || item.category}</td>
                  <td className="py-4 px-4 font-bold text-rose-600">-{Number(item.amount).toLocaleString()}</td>
                  <td className="py-4 px-4">{item.staff?.first_name || "—"}</td>
                  <td className="py-4 px-4 text-rose-400">{item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "—"}</td>
                </>
              )}
              {financeSubTab === "incomes" && (
                <>
                  <td className="py-4 pl-8">{new Date(item.date || item.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-4 font-bold text-zinc-900">{item.description}</td>
                  <td className="py-4 px-4">{item.customer_name || "Mijoz"}</td>
                  <td className="py-4 px-4 font-bold text-emerald-600">+{Number(item.amount).toLocaleString()}</td>
                  <td className="py-4 px-4 uppercase text-[11px]">{item.categoryRel?.name || "Boshqa"}</td>
                  <td className="py-4 px-4 text-rose-400">{item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "—"}</td>
                </>
              )}
              {financeSubTab === "salaries" && (
                <>
                  <td className="py-4 pl-8 font-bold text-zinc-900">{item.staff?.first_name} {item.staff?.last_name}</td>
                  <td className="py-4 px-4">{item.month}/{item.year}</td>
                  <td className="py-4 px-4">{Number(item.base_salary).toLocaleString()}</td>
                  <td className="py-4 px-4 text-[11px]">+{Number(item.bonus_amount).toLocaleString()} / -{Number(item.penalty_amount).toLocaleString()}</td>
                  <td className="py-4 px-4 font-bold text-emerald-600">{Number(item.total_amount).toLocaleString()}</td>
                  <td className="py-4 px-4 text-rose-400">{item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "—"}</td>
                </>
              )}
              {financeSubTab === "bonuses" && (
                <>
                  <td className="py-4 pl-8 font-bold text-zinc-900">{item.staff?.first_name} {item.staff?.last_name}</td>
                  <td className="py-4 px-4 font-bold text-emerald-600">+{Number(item.amount).toLocaleString()}</td>
                  <td className="py-4 px-4">{item.description}</td>
                  <td className="py-4 px-4">{new Date(item.date || item.created_at).toLocaleDateString()}</td>
                  <td className="py-4 px-4 text-rose-400">{item.archived_at ? new Date(item.archived_at).toLocaleDateString() : "—"}</td>
                </>
              )}
              
              <td className="py-4 pr-8 text-right">
                <div className="flex justify-end gap-2 text-zinc-400 hover:text-zinc-600">
                  <button onClick={() => setConfirmDialog({ isOpen: true, type: 'restore', id: item.id, name: item.name || item.description || "Ma'lumot" })} className="p-1 hover:text-emerald-500 transition-colors"><RotateCcw size={16} /></button>
                  <button onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', id: item.id, name: item.name || item.description || "Ma'lumot" })} className="p-1 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-700 h-full overflow-hidden">
      
      {/* 🚀 Dynamic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <ArchiveStatCard 
            title="Umumiy Arxiv" 
            value={stats.totalArchive || data.length || 0} 
            gradient={1} 
            icon={Archive} 
            subtitle={`${activeTab.toUpperCase()} arxivda`}
            loading={loading}
         />
         <ArchiveStatCard 
            title="So'nggi 7 kunda" 
            value={stats.recent || 0} 
            gradient={2} 
            icon={History} 
            subtitle="Yangi qo'shilganlar"
            loading={loading}
         />
         <ArchiveStatCard 
            title="Eski arxivlar" 
            value={stats.older || Math.max(0, (stats.totalArchive || 0) - (stats.recent || 0))} 
            gradient={3} 
            icon={Calendar} 
            subtitle="Uzoq muddatli"
            loading={loading}
         />
         <ArchiveStatCard 
            title="Butunlay o'chirilgan" 
            value="N/A" 
            gradient={4} 
            icon={Trash2} 
            subtitle="Tizimdan tozalangan"
            loading={loading}
         />
      </div>

      {/* 🧭 Tabs & Filters */}
      <Card className="rounded-2xl border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white overflow-hidden flex flex-col flex-1 min-h-[500px]">
         <div className="p-6 border-b border-zinc-50 flex flex-col xl:flex-row justify-between items-center gap-6 bg-zinc-50/20">
            <div className="flex flex-col gap-4">
              <Tabs 
                 value={activeTab} 
                 onValueChange={(v) => { setActiveTab(v as ArchiveTab); setPage(1); }} 
                 className="w-full xl:w-fit"
              >
                 <TabsList className="bg-zinc-100/50 p-1 rounded-xl border border-zinc-100 shadow-sm">
                    {Object.entries(TabIcons).map(([key, Icon]) => (
                      <TabsTrigger 
                         key={key} 
                         value={key}
                         className="rounded-lg px-4 py-2 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                      >
                         <Icon size={14} />
                         {key}
                      </TabsTrigger>
                    ))}
                 </TabsList>
              </Tabs>

              {activeTab === "finance" && (
                 <Tabs 
                    value={financeSubTab} 
                    onValueChange={(v) => { setFinanceSubTab(v as FinanceSubTab); setPage(1); }} 
                    className="w-full xl:w-fit"
                 >
                    <TabsList className="bg-white/50 p-1 rounded-lg border border-zinc-100/50">
                       {Object.entries(FinanceIcons).map(([key, Icon]) => (
                         <TabsTrigger 
                            key={key} 
                            value={key}
                            className="rounded-md px-3 py-1.5 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all flex items-center gap-2"
                         >
                            <Icon size={12} />
                            {key === 'payments' ? "To'lovlar" : key === 'expenses' ? "Xarajatlar" : key === 'incomes' ? "Daromadlar" : key === 'salaries' ? "Maoshlar" : "Bonuslar"}
                         </TabsTrigger>
                       ))}
                    </TabsList>
                 </Tabs>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
               <div className="relative flex-1 min-w-[200px] xl:w-64">
                  <Search className="w-4 h-4 text-zinc-300 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input 
                     placeholder="Qidiruv..."
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="pl-9 h-11 rounded-xl border-zinc-100 bg-white font-bold text-sm focus:border-pink-200 focus:ring-4 focus:ring-pink-50 transition-all outline-none"
                  />
               </div>
               
               <Button className="h-11 px-5 bg-white border border-zinc-100 text-zinc-500 rounded-xl hover:bg-zinc-50 font-bold flex items-center gap-2">
                  <Filter size={16} /> Filitr
               </Button>
               
               <Button 
                  onClick={exportToExcel}
                  className="h-11 px-6 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 font-bold flex items-center gap-2 border-none"
               >
                  <Download size={16} /> Eksport
               </Button>
            </div>
         </div>

         {/* 📊 Data Table Container */}
         <div className="flex-1 overflow-x-auto custom-scrollbar">
            {loading ? (
               <div className="py-32 flex flex-col items-center justify-center gap-4 opacity-50">
                  <Loader2 className="w-10 h-10 animate-spin text-zinc-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Ma'lumotlar yuklanmoqda...</span>
               </div>
            ) : data.length === 0 ? (
               <div className="py-32 flex flex-col items-center justify-center gap-6 opacity-30">
                  <History size={80} strokeWidth={1} className="text-zinc-200" />
                  <div className="text-center">
                     <h3 className="text-lg font-black text-zinc-800 tracking-tight">Arxiv bo'sh</h3>
                     <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Ushbu kategoriya bo'yicha ma'lumotlar topilmadi</p>
                  </div>
               </div>
            ) : (
               <>
                  {activeTab === "crm" && renderCrmTable()}
                  {activeTab === "students" && renderStudentsTable()}
                  {activeTab === "teachers" && renderTeachersTable()}
                  {activeTab === "staff" && renderStaffTable()}
                  {activeTab === "groups" && renderGroupsTable()}
                  {activeTab === "finance" && renderFinanceTable()}
               </>
            )}
         </div>

         <div className="p-4 border-t border-zinc-50 bg-zinc-50/10">
            <CustomPagination 
               currentPage={page} 
               totalPages={totalPages} 
               onPageChange={setPage} 
            />
         </div>
      </Card>

      {/* 🛠 Confirmation Dialog (Unified) */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
         <DialogContent className="sm:max-w-md rounded-[2rem] p-8 border-none shadow-2xl bg-white text-center">
            <DialogHeader className="items-center space-y-4">
               <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-inner transition-colors",
                  confirmDialog?.type === 'restore' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
               )}>
                  {confirmDialog?.type === 'restore' ? <RotateCcw size={32} /> : <AlertTriangle size={32} />}
               </div>
               <DialogTitle className="text-xl font-black text-zinc-900 tracking-tight">
                  {confirmDialog?.type === 'restore' ? "Qayta tiklash" : "Butunlay o'chirish"}
               </DialogTitle>
               <DialogDescription className="text-sm font-bold text-zinc-400 leading-relaxed text-center px-4">
                  {confirmDialog?.type === 'restore' 
                    ? `Ushbu ma'lumotni (${confirmDialog.name}) arxivdan chiqarib, yana faol holatga qaytarasizmi?` 
                    : `Diqqat! ${confirmDialog?.name} tizimdan va arxivdan butunlay o'chirib yuboriladi. Bu amalni ortga qaytarib bo'lmaydi.`}
               </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-8 flex gap-3 w-full justify-center">
               <Button variant="ghost" className="flex-1 h-12 rounded-xl font-black text-zinc-400 uppercase tracking-widest text-[11px]" onClick={() => setConfirmDialog(null)}>Yo'q</Button>
               <Button className={cn(
                  "flex-1 h-12 rounded-xl font-black text-white border-none shadow-xl uppercase tracking-widest text-[11px]",
                  confirmDialog?.type === 'restore' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-rose-600 hover:bg-rose-700 shadow-rose-100"
               )} onClick={handleAction}>
                  {confirmDialog?.type === 'restore' ? "Tiklash" : "O'chirish"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

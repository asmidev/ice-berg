import { FileText, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PayrollFilters } from '@/types/finance';

interface SalariesFiltersProps {
  filters: PayrollFilters;
  setFilters: (filters: PayrollFilters) => void;
  onClear: () => void;
  onAdd: () => void;
  onReport: () => void;
}

export function SalariesFilters({ filters, setFilters, onClear, onAdd, onReport }: SalariesFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-2 rounded-[12px] shadow-sm border border-gray-100/50">
      <div className="w-48 relative group">
        <Input 
          placeholder="Xodim bo'yicha" 
          value={filters.search} 
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="h-10 px-4 text-[12px] bg-white border border-gray-200 rounded-[8px] text-gray-700 outline-none font-semibold placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-pink-200 transition-all shadow-sm"
        />
      </div>
      <div className="w-40">
        <Input 
          type="date"
          value={filters.startDate} 
          onChange={e => setFilters({ ...filters, startDate: e.target.value })}
          className="h-10 px-4 text-[12px] bg-white border border-gray-200 rounded-[8px] text-gray-700 font-semibold shadow-sm"
        />
      </div>
      <div className="w-40">
        <Input 
          type="date"
          value={filters.endDate} 
          onChange={e => setFilters({ ...filters, endDate: e.target.value })}
          className="h-10 px-4 text-[12px] bg-white border border-gray-200 rounded-[8px] text-gray-700 font-semibold shadow-sm"
        />
      </div>
      <div className="w-44">
        <Select value={filters.type} onValueChange={v => setFilters({ ...filters, type: v })}>
          <SelectTrigger className="h-10 px-4 bg-white border border-gray-200 rounded-[8px] text-[12px] text-gray-500 font-semibold focus:ring-1 focus:ring-pink-100 shadow-sm">
            <SelectValue placeholder="Maosh turi bo'yicha" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
            <SelectItem value="all">Barcha turlar</SelectItem>
            <SelectItem value="FIXED">Oylik (Fixed)</SelectItem>
            <SelectItem value="KPI">KPI / Bonus bo'yicha</SelectItem>
            <SelectItem value="HOURLY">Soatbay</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={onClear} 
        variant="ghost" 
        className="h-10 px-5 text-[12px] font-bold text-gray-400 hover:text-[#EC4899] hover:bg-pink-50 rounded-[8px] transition-all"
      >
        Tozalash
      </Button>

      <div className="flex gap-2 ml-auto pr-1">
        <Button onClick={onReport} variant="outline" className="h-10 px-4 rounded-[8px] border-gray-200 text-gray-600 font-bold text-[12px] flex items-center gap-2 bg-white hover:bg-gray-50 transition-all shadow-sm">
           Hisobot <FileText size={14} className="text-gray-400" />
        </Button>
        <Button onClick={onAdd} className="h-10 px-5 rounded-[8px] bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-[12px] flex items-center gap-2 shadow-sm shadow-pink-100 border-none transition-all active:scale-95">
           Qo'shish <Plus size={14} strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
}



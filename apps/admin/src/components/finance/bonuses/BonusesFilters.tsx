import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BonusFilters, BonusSource } from '@/types/finance';
import { Settings2, Plus, RotateCcw } from 'lucide-react';

interface BonusesFiltersProps {
  filters: BonusFilters;
  setFilters: (f: BonusFilters) => void;
  sources: BonusSource[];
  onClear: () => void;
  onAdd: () => void;
  onManageSources: () => void;
}

export function BonusesFilters({ 
  filters, setFilters, sources, onClear, onAdd, onManageSources 
}: BonusesFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 bg-white p-2 rounded-[12px] shadow-sm border border-gray-100/50">
      <div className="w-48 relative group">
        <Input 
          placeholder="Xodimgacha qidirish" 
          value={filters.search} 
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="h-10 px-4 text-[12px] bg-white border border-gray-200 rounded-[8px] text-gray-700 font-semibold placeholder:text-gray-300 focus:ring-1 focus:ring-pink-200 transition-all outline-none"
        />
      </div>

      <div className="w-40">
        <Input 
          type="date"
          value={filters.startDate} 
          onChange={e => setFilters({ ...filters, startDate: e.target.value })}
          className="h-10 px-4 text-[12px] bg-white border border-gray-200 rounded-[8px] text-gray-700 font-semibold shadow-sm focus:ring-1 focus:ring-pink-100"
        />
      </div>

      <div className="w-40">
        <Input 
          type="date"
          value={filters.endDate} 
          onChange={e => setFilters({ ...filters, endDate: e.target.value })}
          className="h-10 px-4 text-[12px] bg-white border border-gray-200 rounded-[8px] text-gray-700 font-semibold shadow-sm focus:ring-1 focus:ring-pink-100"
        />
      </div>

      <div className="w-44">
        <Select value={filters.source_id} onValueChange={v => setFilters({ ...filters, source_id: v })}>
          <SelectTrigger className="h-10 px-4 bg-white border border-gray-200 rounded-[8px] text-[12px] text-gray-500 font-semibold focus:ring-1 focus:ring-pink-100 shadow-sm">
            <SelectValue placeholder="Bonus turi" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-100 shadow-2xl">
            <SelectItem value="all">Barcha turlar</SelectItem>
            {sources.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={onClear} 
        variant="ghost" 
        className="h-10 px-4 text-[12px] font-bold text-gray-400 hover:text-[#EC4899] hover:bg-pink-50 rounded-[8px] transition-all"
      >
        <RotateCcw size={14} className="mr-2" /> Tozalash
      </Button>

      <div className="flex gap-2 ml-auto pr-1">
        <Button 
          onClick={onManageSources} 
          variant="outline" 
          className="h-10 px-4 rounded-[8px] border-gray-200 text-gray-600 font-bold text-[12px] flex items-center gap-2 bg-white hover:bg-gray-50 transition-all shadow-sm"
        >
           Manbalar <Settings2 size={14} className="text-gray-400" />
        </Button>
        <Button 
          onClick={onAdd} 
          className="h-10 px-5 rounded-[8px] bg-[#EC4899] hover:bg-pink-600 text-white font-bold text-[12px] flex items-center gap-2 shadow-sm shadow-pink-100 border-none transition-all active:scale-95"
        >
           Bonus yozish <Plus size={14} strokeWidth={3} />
        </Button>
      </div>
    </div>
  );
}

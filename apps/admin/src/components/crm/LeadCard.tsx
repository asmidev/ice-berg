import React from 'react';
import { Card } from '@/components/ui/card';
import { PhoneCall, MoreHorizontal, MessageSquare, Clock, ArchiveX, ChevronRight, User } from 'lucide-react';

interface LeadCardProps {
  item: any;
  nextStageName?: string;
  stageColor: string;
  onArchive: (leadId: string) => void;
  onMoveStage?: (leadId: string) => void;
  isDragging?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({ 
  item, 
  nextStageName, 
  stageColor, 
  onArchive, 
  onMoveStage,
  isDragging 
}) => {
  const diffTime = Math.abs(new Date().getTime() - new Date(item.created_at).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <Card className={`p-4 border shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 rounded-xl group relative overflow-hidden
      ${isDragging ? `border-${stageColor}-400 shadow-xl scale-[1.02] bg-white ring-2 ring-${stageColor}-100 rotate-2` : 'border-gray-100 bg-white hover:border-pink-300 hover:shadow-lg hover:-translate-y-1'}`}>
      
      {/* Decorative side bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${stageColor}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />

      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-gray-50 text-gray-500 border border-gray-100 w-fit">
            {item.source?.name || 'Boshqa'}
          </span>
          <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-fit">
            ID-{item.id.slice(0, 6).toUpperCase()}
          </span>
        </div>
        
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); onArchive(item.id); }}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
            title="Lidni Arxivlash"
          >
            <ArchiveX className="w-4 h-4" />
          </button>
          <button className="text-gray-300 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-full bg-${stageColor}-50 flex items-center justify-center shrink-0`}>
          <User className={`w-4.5 h-4.5 text-${stageColor}-600`} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-gray-900 text-[15px] truncate tracking-tight">{item.name}</h4>
          <p className="text-[12px] font-semibold text-gray-500 flex items-center mt-0.5">
            <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> 
            {item.phone}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 mr-1" /> {new Date(item.created_at).toLocaleDateString()}
          </span>
          <span className={`text-[9px] font-black uppercase mt-0.5 ${diffDays > 3 ? 'text-red-400' : 'text-green-500'}`}>
            {diffDays} kun bo'ldi
          </span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-all cursor-pointer group/msg">
          <MessageSquare className="w-3.5 h-3.5 text-gray-400 group-hover/msg:scale-110" />
        </div>
      </div>

      {nextStageName && onMoveStage && (
        <button 
          onClick={(e) => { e.stopPropagation(); onMoveStage(item.id); }}
          className={`mt-3 w-full flex items-center justify-center text-[11px] font-black py-2 rounded-xl border transition-all 
            bg-${stageColor}-50 text-${stageColor}-700 border-${stageColor}-100 hover:bg-${stageColor}-600 hover:text-white hover:border-transparent active:scale-95 shadow-sm`}
        >
          {nextStageName} <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </button>
      )}
    </Card>
  );
};

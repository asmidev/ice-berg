import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;

  // Simple range for now, can be expanded if totalPages is large
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center mt-6 mb-10 select-none">
      <div className="inline-flex bg-white rounded-full border border-zinc-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-10 divide-x divide-zinc-100">
        
        {/* Prev Arrow */}
        <button 
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 flex items-center justify-center bg-[#EBEBEB] hover:bg-zinc-200 disabled:opacity-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-zinc-500" />
        </button>

        {/* Page Numbers */}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 text-[13px] font-bold transition-all ${
              currentPage === p 
                ? 'bg-[#4465aa] text-white' 
                : 'bg-white text-zinc-400 hover:bg-zinc-50'
            }`}
          >
            {p}
          </button>
        ))}

        {/* Next Arrow */}
        <button 
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 flex items-center justify-center bg-white hover:bg-zinc-50 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>
      </div>
    </div>
  );
};

export default CustomPagination;

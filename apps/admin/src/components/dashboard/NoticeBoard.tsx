import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  category: string;
  categoryType: 'academic' | 'training' | 'resources' | 'announcement';
  audience: string;
  date: string;
  createdBy: string;
  image?: string;
}

const notices: Notice[] = [
  {
    id: '1',
    title: 'Science Fair Registration Opens',
    category: 'Academic',
    categoryType: 'academic',
    audience: 'All Students',
    date: 'March 8, 2035',
    createdBy: 'Academic Coordinator',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=80&h=80&fit=crop'
  },
  {
    id: '2',
    title: 'Teacher Development Workshop',
    category: 'Training',
    categoryType: 'training',
    audience: 'All Teachers',
    date: 'March 10, 2035',
    createdBy: "Principal's Office"
  },
  {
    id: '3',
    title: 'New Library Books Arrived',
    category: 'Resources',
    categoryType: 'resources',
    audience: 'Students & Teachers',
    date: 'March 12, 2035',
    createdBy: 'Librarian'
  }
];

export const NoticeBoard = () => {
  return (
    <Card className="border-none shadow-[0_2px_12px_rgba(0,0,0,0.04)] bg-white rounded-[24px] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-8 pt-8">
        <CardTitle className="text-[17px] font-bold text-gray-900">Notice Board</CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-medium text-gray-400">Sort by:</span>
          <Select defaultValue="popular">
            <SelectTrigger className="w-[100px] h-9 rounded-xl border-none bg-gray-50/50 text-[12px] font-bold text-gray-600 focus:ring-pink-500/20">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="space-y-6">
          {notices.map((notice) => (
            <div key={notice.id} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                   {notice.image ? (
                     <img src={notice.image} alt="" className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center text-pink-500 font-bold">N</div>
                   )}
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-[14px] font-bold text-gray-900 group-hover:text-pink-500 transition-colors uppercase tracking-tight">{notice.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-pink-50 text-pink-600 text-[9px] uppercase font-bold py-0 h-4 border-none">
                      {notice.category}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:flex flex-col gap-0.5 min-w-[120px]">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Audience</span>
                <span className="text-[12px] font-bold text-gray-700">{notice.audience}</span>
              </div>
              
              <div className="hidden lg:flex flex-col gap-0.5 min-w-[120px]">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Date</span>
                <span className="text-[12px] font-bold text-gray-700">{notice.date}</span>
              </div>
              
              <div className="hidden lg:flex flex-col gap-0.5 min-w-[140px]">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Created By</span>
                <span className="text-[12px] font-bold text-gray-700">{notice.createdBy}</span>
              </div>

              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

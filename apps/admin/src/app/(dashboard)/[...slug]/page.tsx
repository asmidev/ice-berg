import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, Sparkles, ChevronRight, Home, Settings, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: { slug: string[] };
}

// Function to format the URL slug into a readable string (e.g. 'center-info' -> 'Center Info')
function formatSlugSegment(segment: string) {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// English to Uzbek generic mapper for known routes to make the title look more natural if needed,
// but for now, we'll just format the slug nicely.
export default function DynamicSubPage({ params }: PageProps) {
  const { slug } = params;
  
  // Create breadcrumbs
  const breadcrumbs = slug.map(formatSlugSegment);
  const currentTitle = breadcrumbs[breadcrumbs.length - 1];
  
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500 pb-10 min-h-full">
      
      {/* Dynamic Header & Breadcrumbs */}
      <div className="flex flex-col gap-2 bg-zinc-50 p-6 rounded-2xl shadow-sm border border-zinc-200">
        
        {/* Breadcrumb Trail */}
        <div className="flex items-center text-xs font-semibold text-zinc-500 mb-2">
          <Link href="/dashboard" className="hover:text-blue-400 transition-colors">
            <Home className="w-3.5 h-3.5" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb} className="flex items-center">
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 opacity-50" />
              <span className={`${index === breadcrumbs.length - 1 ? 'text-blue-400 font-bold' : 'hover:text-blue-400'} transition-colors cursor-default`}>
                {crumb}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-800 tracking-tight">{currentTitle}</h1>
            <p className="text-zinc-500 text-sm mt-1">Ushbu bo'lim hozirda ishlab chiqilmoqda (Tez kunda ishga tushadi)</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 border-zinc-200 text-zinc-500 hover:bg-white shadow-sm font-medium">
              <Settings className="w-4 h-4 mr-2" /> Bo'lim Sozlamalari
            </Button>
            <Button className="h-10 bg-blue-600/90 hover:bg-blue-600 hover:bg-blue-600 shadow-sm shadow-blue-500/20 text-zinc-800 font-medium">
              <Sparkles className="w-4 h-4 mr-2" /> Yangilanish so'rash
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Generic Placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="w-32 h-32 bg-gradient-to-tr from-blue-100 to-blue-50 border-4 border-white rounded-3xl shadow-xl flex items-center justify-center relative z-10 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <Construction className="w-12 h-12 text-blue-400" />
          </div>
          
          <div className="absolute -top-4 -right-4 w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-full shadow flex items-center justify-center z-20 animate-bounce delay-100">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-zinc-800 mb-3 text-center">{currentTitle} Moduli</h2>
        <p className="text-zinc-500 text-center max-w-md font-medium mb-8 leading-relaxed">
          Siz bu yerda o'zingizning muassasangizga tegishli bo'lgan barcha <span className="text-blue-400 font-bold">"{currentTitle}"</span> sozlamalari va ma'lumotlarini tez kunda boshqara olasiz. Bizning jamoa ushbu sahifa ustida qizg'in ish olib bormoqda!
        </p>

        <Link href="/dashboard">
          <Button variant="outline" className="h-11 px-6 border-zinc-200 text-zinc-500 font-bold shadow-sm rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Bosh Sahifaga Qaytish
          </Button>
        </Link>
      </div>

      {/* Mock Table Below to look like an admin page */}
      <Card className="border-0 shadow-sm bg-zinc-50 overflow-hidden opacity-50 select-none pointer-events-none mt-10">
        <div className="border-b border-zinc-200 p-4 px-6 bg-white/50 flex justify-between items-center blur-[1px]">
          <div className="h-4 w-32 bg-zinc-100 rounded"></div>
          <div className="h-8 w-48 bg-zinc-100 rounded-lg"></div>
        </div>
        <CardContent className="p-0 blur-[2px]">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-zinc-200 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-50"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-32 bg-zinc-100 rounded"></div>
                    <div className="h-2 w-20 bg-zinc-50 rounded"></div>
                  </div>
                </div>
                <div className="h-6 w-24 bg-zinc-50 rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

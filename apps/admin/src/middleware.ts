import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Agar token yo'q bo'lsa va foydalanuvchi dashboard sahifasiga kirmoqchi bo'lsa
  if (!token && pathname !== '/login') {
    const isDashboardPath = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/students') || 
                          pathname.startsWith('/crm') || 
                          pathname.startsWith('/lms') || 
                          pathname.startsWith('/teachers') || 
                          pathname.startsWith('/finance') || 
                          pathname.startsWith('/settings');
    
    if (isDashboardPath) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Agar token bo'lsa va foydalanuvchi login sahifasiga kirmoqchi bo'lsa
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Qaysi yo'nalishlar uchun middleware ishlashini belgilash
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

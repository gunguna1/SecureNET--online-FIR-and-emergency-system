import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes mapping. Any route starting with these paths requires authentication.
const protectedRoutes = ['/citizen', '/officer', '/control-room', '/authority'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const token = request.cookies.get('auth_token')?.value;
    
    // If no token exists, immediately redirect to login page before rendering
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Future enhancement: We could decode the JWT here to check if the user's role 
    // actually matches the route they are trying to access. For a beginner level, 
    // the presence of a valid token is enough for server-side middleware,
    // and the client-side DashboardShell enforces role routing.
  }
  
  // If the user tries to go to login or register while already logged in, redirect them
  if (pathname === '/login' || pathname === '/register') {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      // In a real app we'd redirect to their specific role dashboard,
      // but without decoding the token, we can just redirect home and let the client handle it,
      // or redirect to a generic page. Let's just let DashboardShell handle role routing.
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Config to optimize middleware performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};

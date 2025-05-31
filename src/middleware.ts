// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔍 Middleware executado:', {
    pathname,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value]))
  });

  // Se está tentando acessar dashboard
  if (pathname.startsWith('/dashboard')) {
    console.log('📊 Middleware: Acesso ao dashboard detectado');
    
    // Verificar se há token nos cookies ou headers
    const authToken = request.cookies.get('auth_token')?.value || 
                      request.headers.get('authorization');
    
    const selectedTenant = request.cookies.get('selected_tenant')?.value ||
                          request.headers.get('x-subdomain');
    
    console.log('🔑 Middleware: Verificação de auth:', {
      hasToken: !!authToken,
      hasTenant: !!selectedTenant,
      token: authToken ? authToken.substring(0, 20) + '...' : null,
      tenant: selectedTenant
    });

    // Em desenvolvimento, permitir acesso sempre
    if (process.env.NODE_ENV === 'development') {
      console.log('🚧 Middleware: Modo desenvolvimento - permitindo acesso');
      return NextResponse.next();
    }

    // Se não tem token, redirecionar para login
    if (!authToken) {
      console.log('❌ Middleware: Sem token - redirecionando para login');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Se não tem tenant, redirecionar para seleção
    if (!selectedTenant) {
      console.log('❌ Middleware: Sem tenant - redirecionando para login');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Para todas as outras rotas, permitir acesso
  console.log('✅ Middleware: Permitindo acesso à rota:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
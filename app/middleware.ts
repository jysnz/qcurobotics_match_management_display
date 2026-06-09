import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname === '/login'
  const isAuthCallback = request.nextUrl.pathname === '/auth/callback'

  // If unauthenticated and not on auth pages, redirect to login
  if (!user && !isLoginPage && !isAuthCallback) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated, check for user_accounts record
  if (user && !isAuthCallback) {
    const { data: account } = await supabase
      .from('user_accounts')
      .select('id')
      .eq('id', user.id)
      .single()

    // If no record in user_accounts, treat as unauthorized (no registration allowed)
    if (!account && !isLoginPage) {
       // Sign out and redirect
       await supabase.auth.signOut()
       const loginUrl = new URL('/login', request.url)
       loginUrl.searchParams.set('error', 'unauthorized')
       return NextResponse.redirect(loginUrl)
    }

    // Redirect away from login if already authenticated and has account
    if (isLoginPage && account) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

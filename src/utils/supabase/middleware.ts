import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
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
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Documented way to refresh session
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/onboarding') ||
        request.nextUrl.pathname.startsWith('/announcements') ||
        request.nextUrl.pathname.startsWith('/dues') ||
        request.nextUrl.pathname.startsWith('/events') ||
        request.nextUrl.pathname.startsWith('/polls') ||
        request.nextUrl.pathname.startsWith('/directory') ||
        request.nextUrl.pathname.startsWith('/documents');

    const isDemoMode = request.cookies.get('quormet_demo_mode')?.value === 'true';

    if (!user && isProtectedRoute && !isDemoMode) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Redirect logged in users away from auth pages if they try to access them
    if (user && (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/signup'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

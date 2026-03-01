/**
 * Middleware helper to manage and refresh Supabase sessions, including route protection 
 * logic that handles both authenticated users and a demo mode login state.
 */
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

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isProtectedRoute = request.nextUrl.pathname.startsWith('/home') ||
        request.nextUrl.pathname.startsWith('/onboarding') ||
        request.nextUrl.pathname.startsWith('/announcements') ||
        request.nextUrl.pathname.startsWith('/payments') ||
        request.nextUrl.pathname.startsWith('/fees') ||
        request.nextUrl.pathname.startsWith('/dues') ||
        request.nextUrl.pathname.startsWith('/help') ||
        request.nextUrl.pathname.startsWith('/events') ||
        request.nextUrl.pathname.startsWith('/polls') ||
        request.nextUrl.pathname.startsWith('/directory') ||
        request.nextUrl.pathname.startsWith('/board') ||
        request.nextUrl.pathname.startsWith('/issues') ||
        request.nextUrl.pathname.startsWith('/settings') ||
        request.nextUrl.pathname.startsWith('/documents');

    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    if (user && (request.nextUrl.pathname.startsWith('/sign-in') || request.nextUrl.pathname.startsWith('/sign-up'))) {
        return NextResponse.redirect(new URL('/home', request.url))
    }

    return supabaseResponse
}

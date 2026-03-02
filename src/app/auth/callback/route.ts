import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getBaseUrl } from '@/lib/utils'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirection URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${getBaseUrl()}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${getBaseUrl()}/auth/auth-code-error`)
}

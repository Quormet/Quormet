/**
 * Defines server actions for user authentication, including standard sign-up, sign-in, 
 * OAuth-based sign-in, sign-out, and a demo mode login.
 */
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers, cookies } from 'next/headers'
import { db } from '@/db'
import { communities, users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            },
            emailRedirectTo: `${(await headers()).get('origin')}/auth/callback`,
        },
    })

    if (error) {
        throw new Error(error.message)
    }

    if (data.session) {
        revalidatePath('/', 'layout')
        redirect('/onboarding')
    }

    return { success: true, message: 'Check your email to confirm your account!' }
}

export async function signIn(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/', 'layout')
    return redirect('/dashboard')
}

export async function signInWithOAuth(provider: 'google' | 'github') {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${(await headers()).get('origin')}/auth/callback`,
        },
    })

    if (error) {
        throw new Error(error.message)
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    const cookieStore = await cookies()
    cookieStore.delete('quormet_demo_mode')

    revalidatePath('/', 'layout')
    return redirect('/')
}

export async function signInAsDemo() {
    const cookieStore = await cookies()
    cookieStore.set('quormet_demo_mode', 'true', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 24 hours
    })

    const demoUserId = 'demo-user-id'
    const demoEmail = 'demo@example.com'

    let demoCommunity = (await db.select().from(communities).where(eq(communities.name, 'Demo Community')).limit(1))[0]
    if (!demoCommunity) {
        demoCommunity = (await db.insert(communities).values({
            name: 'Demo Community',
            joinCode: 'DEMO12',
        }).returning())[0]
    }

    await db.insert(users).values({
        supabaseId: demoUserId,
        name: 'Demo User',
        email: demoEmail,
        role: 'admin',
        communityId: demoCommunity.id,
    }).onConflictDoUpdate({
        target: users.supabaseId,
        set: {
            communityId: demoCommunity.id,
            role: 'admin',
        }
    })

    revalidatePath('/', 'layout')
    return redirect('/dashboard')
}

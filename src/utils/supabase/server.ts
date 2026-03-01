import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )

    // Proxy the auth object to inject a mock user if demo mode is active
    const isDemoMode = cookieStore.get('quormet_demo_mode')?.value === 'true';
    if (isDemoMode) {
        const demoUser = {
            id: 'demo-user-id',
            email: 'demo@example.com',
            user_metadata: { full_name: 'Demo User' },
        };

        return new Proxy(supabase, {
            get(target: any, prop) {
                if (prop === 'auth') {
                    return {
                        ...target.auth,
                        getUser: async () => ({ data: { user: demoUser }, error: null }),
                        getSession: async () => ({ data: { session: { user: demoUser } }, error: null }),
                    };
                }
                return target[prop];
            }
        });
    }

    return supabase;
}

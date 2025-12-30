'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignOutPage() {
    const router = useRouter();

    useEffect(() => {
        const performSignOut = async () => {
            // Safety Timeout - Force redirect after 2s no matter what
            const timer = setTimeout(() => {
                if (typeof window !== 'undefined') window.location.href = '/';
            }, 2000);

            // 1. Try Supabase SignOut (Non-blocking)
            supabase.auth.signOut().catch(console.error);

            // 2. Clear Local Storage immediately
            if (typeof window !== 'undefined') {
                window.localStorage.clear();
                window.sessionStorage.clear();

                // 3. Nuke Cookies
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
                });

                // 4. Force Redirect (Clear timeout since we are done)
                clearTimeout(timer);
                window.location.href = '/';
            }
        };

        performSignOut();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Signing Out...</h1>
                <p className="text-gray-500">Please wait while we clear your session.</p>
            </div>
        </div>
    );
}

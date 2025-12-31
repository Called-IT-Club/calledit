'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomeAuthButtons() {
    const { signInWithGoogle, user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading || user) return null;

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto md:mx-0">
            <button
                onClick={() => signInWithGoogle()}
                className="btn bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 py-3 text-lg w-full shadow-sm transition-all hover:scale-[1.02]"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                <span>Sign in with Google</span>
            </button>
        </div>
    );
}

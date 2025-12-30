'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function HomeAuthButtons() {
    const { signInWithGoogle, signInWithApple, signInAsGuest, user } = useAuth();
    const router = useRouter();

    if (user) {
        router.push('/dashboard');
        return null;
    }

    const handleGuestLogin = async () => {
        try {
            await signInAsGuest();
            router.push('/dashboard');
        } catch (error) {
            console.error('Guest login failed:', error);
        }
    };

    return (
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto md:mx-0">
            <button
                onClick={() => signInWithGoogle()}
                className="btn bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 py-3 text-lg w-full shadow-sm transition-all hover:scale-[1.02]"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                <span>Sign in with Google</span>
            </button>

            <button
                onClick={() => signInWithApple()}
                className="btn bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 py-3 text-lg w-full shadow-sm transition-all hover:scale-[1.02]"
            >
                <img src="https://www.svgrepo.com/show/445136/apple.svg" className="w-6 h-6" alt="Apple" />
                <span>Sign in with Apple</span>
            </button>

            <button
                onClick={handleGuestLogin}
                className="btn bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 flex items-center justify-center gap-2 py-2 text-sm w-full transition-colors mt-2"
            >
                Continue as Guest 👤
            </button>
        </div>
    );
}

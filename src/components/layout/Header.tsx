'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/auth/LoginButton';

export default function Header() {
    const pathname = usePathname();
    const { user } = useAuth();
    const isFeed = pathname === '/feed';

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Brand / Logo */}
                <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-3">
                    <div className="bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
                        <img src="/logo.png" alt="Called It Check Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter text-blue-700 leading-none whitespace-nowrap">
                            CALLED IT!
                        </h1>
                        <p className="text-[10px] font-medium text-gray-500 tracking-wide">
                            Join the Club. Make the Call.
                        </p>
                    </div>
                </Link>

                {/* Navigation & Auth */}
                <div className="flex items-center gap-2">
                    {/* Make A Call Action - Primary */}
                    <Link
                        href="/dashboard?new_call=true"
                        className="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg mr-2"
                    >
                        <span>+</span>
                        Make A Call
                    </Link>

                    {/* Dashboard Link - Only visible on Feed Page and if logged in */}
                    {isFeed && user && (
                        <Link
                            href="/dashboard"
                            className="text-sm font-bold px-4 py-2 rounded-full transition-all border text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent flex items-center gap-2"
                        >
                            <img src="/logo.png" alt="My Calls" className="w-5 h-5 object-contain" />
                            My Calls
                        </Link>
                    )}

                    {/* Live Feed Link - Hidden on Feed Page */}
                    {!isFeed && (
                        <Link
                            href="/feed"
                            className="text-sm font-bold px-4 py-2 rounded-full transition-all border flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent"
                        >
                            <span>👀</span>
                            Live Feed
                        </Link>
                    )}

                    {/* Always show Auth Button (Circle only when logged in) */}
                    <LoginButton />
                </div>
            </div>
        </header>
    );
}

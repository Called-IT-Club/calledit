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
                        <p className="hidden sm:block text-[10px] font-medium text-gray-500 tracking-wide">
                            Join the Club. Make the Call.
                        </p>
                    </div>
                </Link>

                {/* Navigation & Auth */}
                <div className="flex items-center gap-2">

                    {/* Make A Call Action - Primary */}
                    <Link
                        href="/dashboard?new_call=true"
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 sm:w-auto sm:h-auto px-0 sm:px-5 py-0 sm:py-2.5 rounded-full transition-all shadow-md hover:shadow-lg mr-2"
                    >
                        <span className="text-xl sm:text-base font-bold leading-none mb-0.5 sm:mb-0">+</span>
                        <span className="hidden sm:inline text-sm font-bold">Make A Call</span>
                    </Link>

                    {/* Friends Link */}
                    {user && (
                        <Link
                            href="/friends"
                            className="inline-flex items-center justify-center gap-2 bg-white sm:bg-transparent hover:bg-gray-50 sm:hover:bg-gray-100 text-gray-700 sm:text-gray-600 hover:text-gray-900 w-10 h-10 sm:w-auto sm:h-auto px-0 sm:px-4 py-0 sm:py-2 rounded-full transition-all border border-gray-200 sm:border-transparent shadow-md sm:shadow-none"
                        >
                            <span className="text-xl sm:text-base leading-none">👥</span>
                            <span className="hidden sm:inline text-sm font-bold">Friends</span>
                        </Link>
                    )}


                    {/* Dashboard Link - Only visible on Feed Page and if logged in */}
                    {isFeed && user && (
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 bg-white sm:bg-transparent hover:bg-gray-50 sm:hover:bg-gray-100 text-gray-700 sm:text-gray-600 hover:text-gray-900 w-10 h-10 sm:w-auto sm:h-auto px-0 sm:px-4 py-0 sm:py-2 rounded-full transition-all border border-gray-200 sm:border-transparent shadow-md sm:shadow-none"
                        >
                            <img src="/logo.png" alt="My Calls" className="w-6 h-6 object-contain" />
                            <span className="hidden sm:inline text-sm font-bold">My Calls</span>
                        </Link>
                    )}

                    {/* Live Feed Link - Hidden on Feed Page */}
                    {!isFeed && (
                        <Link
                            href="/feed"
                            className="inline-flex items-center justify-center gap-2 bg-white sm:bg-transparent hover:bg-gray-50 sm:hover:bg-gray-100 text-gray-700 sm:text-gray-600 hover:text-gray-900 w-10 h-10 sm:w-auto sm:h-auto px-0 sm:px-4 py-0 sm:py-2 rounded-full transition-all border border-gray-200 sm:border-transparent shadow-md sm:shadow-none"
                        >
                            <span className="text-2xl sm:text-base leading-none">👀</span>
                            <span className="hidden sm:inline text-sm font-bold">Live Feed</span>
                        </Link>
                    )}

                    {/* Always show Auth Button (Circle only when logged in) */}
                    <LoginButton />
                </div>
            </div>
        </header >
    );
}

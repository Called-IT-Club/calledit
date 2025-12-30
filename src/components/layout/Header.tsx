'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LoginButton from '@/components/auth/LoginButton';

export default function Header() {
    const pathname = usePathname();
    const isFeed = pathname === '/feed';
    const isDashboard = pathname === '/dashboard';

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Brand / Logo */}
                <Link href="/" className="hover:opacity-80 transition-opacity">
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter text-blue-700">
                            CALLED IT!
                        </h1>
                        <p className="text-[10px] font-medium text-gray-500 tracking-wide">
                            Join the Club. Make the Call.
                        </p>
                    </div>
                </Link>

                {/* Navigation & Auth */}
                <div className="flex items-center gap-3">
                    {/* Show 'Dashboard' link if not on dashboard */}
                    {!isDashboard && (
                        <Link
                            href="/dashboard"
                            className="hidden sm:inline-block text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors"
                        >
                            My Calls
                        </Link>
                    )}

                    {/* Show 'Live Feed' link if not on feed */}
                    {!isFeed && (
                        <Link
                            href="/feed"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors flex items-center gap-2"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Live Feed
                        </Link>
                    )}

                    {/* Always show Auth Button */}
                    <LoginButton />
                </div>
            </div>
        </header>
    );
}

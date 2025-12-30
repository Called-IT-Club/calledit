'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on share page for clean screenshot/view
    if (pathname?.startsWith('/share/')) return null;

    return (
        <footer className="border-t border-gray-100 bg-white mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} CALLED IT!
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                        <Link href="/terms" className="hover:text-blue-600 transition-colors">
                            Terms of Use
                        </Link>
                        <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/notices" className="hover:text-blue-600 transition-colors">
                            Notices & License
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

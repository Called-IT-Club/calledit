import Link from 'next/link';

export default function NoticesPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm max-w-3xl w-full">
                <div className="mb-8">
                    <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
                </div>

                <h1 className="text-3xl font-bold mb-6 text-gray-900">Notices & Licenses</h1>

                <div className="space-y-8 text-gray-700 leading-relaxed">
                    <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h2 className="text-xl font-bold mb-2 text-gray-900">Called It License</h2>
                        <div className="font-mono text-sm bg-white p-4 rounded border border-gray-200 overflow-x-auto">
                            <p className="font-bold text-gray-900">PRIVATE LICENSE</p>
                            <p className="mt-2">Use for Called It.</p>
                            <p className="mt-2">
                                Copyright &copy; {new Date().getFullYear()} CALLED IT!. All rights reserved.
                            </p>
                            <p className="mt-4">
                                This software is proprietary. Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4 text-gray-900">Third Party Licenses</h2>
                        <p className="mb-4">This application uses the following open source software:</p>

                        <div className="space-y-4">
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="font-medium text-gray-900">Next.js</h3>
                                <p className="text-sm text-gray-500">MIT License - Copyright (c) 2025 Vercel, Inc.</p>
                            </div>
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="font-medium text-gray-900">React</h3>
                                <p className="text-sm text-gray-500">MIT License - Copyright (c) Meta Platforms, Inc.</p>
                            </div>
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="font-medium text-gray-900">Tailwind CSS</h3>
                                <p className="text-sm text-gray-500">MIT License - Copyright (c) Tailwind Labs, Inc.</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Lucide React</h3>
                                <p className="text-sm text-gray-500">ISC License - Copyright (c) Lucide Contributors</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

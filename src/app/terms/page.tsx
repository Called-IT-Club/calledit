import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm max-w-3xl w-full">
                <div className="mb-8">
                    <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
                </div>

                <h1 className="text-3xl font-bold mb-6 text-gray-900">Terms of Use</h1>
                <p className="text-sm text-gray-500 mb-8">Last Updated: December 27, 2025</p>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using the "Called It" application, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">2. Use License</h2>
                        <p>
                            Permission is granted to temporarily download one copy of the materials (information or software) on Called It's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                        </p>
                        <p className="mt-2 text-gray-900 font-medium">
                            Private License - Use for Called It. All rights reserved.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">3. Disclaimer</h2>
                        <p>
                            The materials on Called It's website are provided on an 'as is' basis. Called It makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">4. Predictions</h2>
                        <p>
                            "Called It" is a platform for entertainment purposes only. Predictions made on this platform are user-generated content. We do not guarantee the accuracy of any predictions, and they should not be used as financial, medical, or legal advice.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm max-w-3xl w-full">
                <div className="mb-8">
                    <Link href="/" className="text-blue-600 hover:underline">← Back to Home</Link>
                </div>

                <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
                <p className="text-sm text-gray-500 mb-8">Last Updated: December 27, 2025</p>

                <div className="space-y-6 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, make a prediction, or communicate with us. This may include your name, email address, and prediction content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect CALLED IT! and our users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">3. Data Security</h2>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2 text-gray-900">4. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

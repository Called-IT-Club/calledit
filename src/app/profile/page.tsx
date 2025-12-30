'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { User } from '@/types';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch current user (mocked as user-1)
        const fetchUser = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/users/user-1');
                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    const addFriendUrl = `${window.location.origin}/add-friend/${user.id}`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            <nav className="w-full max-w-md mb-8 flex items-center justify-between">
                <Link href="/dashboard" className="text-blue-600 font-medium">← Back</Link>
                <h1 className="font-bold text-lg">My Profile</h1>
                <div className="w-10"></div>{/* Spacer */}
            </nav>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-center w-full max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {user.name?.[0] || 'U'}
                </div>

                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                <p className="text-gray-500 text-sm mb-8">{user.email}</p>

                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-6">
                    <QRCode value={addFriendUrl} size={200} />
                </div>

                <p className="text-sm text-gray-600 font-medium">
                    Scan to follow me
                </p>

                <div className="mt-8 flex justify-center gap-8 text-center border-t border-gray-100 pt-6">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{user.following?.length || 0}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Following</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Followers</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useAuth } from '@/contexts/AuthContext';
import QRCode from 'react-qr-code';
import { User } from '@/types';
import Link from 'next/link';

export default function ProfilePage() {
    const { user: authUser, isLoading, isAdmin } = useAuth();

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!authUser) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div>Please sign in to view your profile</div>
            <Link href="/" className="text-blue-600 hover:underline">Go Home</Link>
        </div>
    );

    const user: User = {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.full_name || 'User',
        provider: authUser.app_metadata?.provider as any || 'email',
        role: isAdmin ? 'admin' : 'user',
        following: [] // TODO: Implement real following
    };

    const addFriendUrl = `${window.location.origin}/add-friend/${user.id}`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            <nav className="w-full max-w-md mb-8 flex items-center justify-between">
                <Link href="/dashboard" className="text-blue-600 font-medium">← Back</Link>
                <h1 className="font-bold text-lg">My Profile</h1>
                <div className="w-10"></div>{/* Spacer */}
            </nav>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-center w-full max-w-sm">
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold overflow-hidden relative">
                    {authUser.user_metadata?.avatar_url ? (
                        <img src={authUser.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        user.name?.[0] || 'U'
                    )}
                </div>

                {user.role === 'admin' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 uppercase tracking-widest mb-2 border border-purple-200">
                        Admin
                    </span>
                )}

                <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
                <p className="text-gray-500 text-sm mb-8">{user.email}</p>

                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-4">
                    <QRCode value={addFriendUrl} size={200} />
                </div>

                <p className="text-sm text-gray-600 font-medium mb-3">
                    Scan to follow me
                </p>

                <button
                    onClick={() => {
                        navigator.clipboard.writeText(addFriendUrl);
                        alert('Profile link copied to clipboard!');
                    }}
                    className="btn btn-secondary text-sm px-4 py-2 w-full max-w-xs"
                >
                    📋 Copy Profile Link
                </button>

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

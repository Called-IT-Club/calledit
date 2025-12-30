'use client';

import { use, useState, useEffect } from 'react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddFriendPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const router = useRouter();
    const [targetUser, setTargetUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    // Mock current user ID
    const currentUserId = 'user-1';

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Fetch target user
                const userRes = await fetch(`http://localhost:3001/api/users/${userId}`);
                const userData = await userRes.json();
                setTargetUser(userData);

                // Check if already following (fetching current user)
                const meRes = await fetch(`http://localhost:3001/api/users/${currentUserId}`);
                const meData = await meRes.json();
                if (meData.following?.includes(userId)) {
                    setIsFollowing(true);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (userId === currentUserId) {
            router.push('/profile'); // Redirect if scanning own code
        } else {
            checkStatus();
        }
    }, [userId, router]);

    const handleFollow = async () => {
        try {
            await fetch(`http://localhost:3001/api/users/${userId}/follow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentUserId })
            });
            setIsFollowing(true);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!targetUser) return <div className="min-h-screen flex items-center justify-center">User not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                    {targetUser.name?.[0] || 'U'}
                </div>

                <h1 className="text-2xl font-bold mb-2">{targetUser.name}</h1>
                <p className="text-gray-500 mb-8">invites you to follow their predictions</p>

                {isFollowing ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                            <span>✅</span> You are following {targetUser.name}
                        </div>
                        <Link href="/dashboard" className="btn btn-secondary w-full block">
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <button
                        onClick={handleFollow}
                        className="btn btn-primary w-full py-4 text-lg shadow-blue-200 shadow-lg"
                    >
                        Follow {targetUser.name}
                    </button>
                )}
            </div>
        </div>
    );
}

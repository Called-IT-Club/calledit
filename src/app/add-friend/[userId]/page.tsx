'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface TargetProfile {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
}

/**
 * Add Friend Page
 * Allows users to follow other users by scanning their QR code or visiting their profile link.
 * Redirects to login if not authenticated.
 */
export default function AddFriendPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId: targetUserId } = use(params);
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    const [targetUser, setTargetUser] = useState<TargetProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!authLoading && !user) {
            router.push('/');
            return;
        }

        // Redirect if trying to follow yourself
        if (user && targetUserId === user.id) {
            router.push('/profile');
            return;
        }

        const checkStatus = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);

                // Fetch target user profile from Supabase
                const profileRes = await fetch(`/api/profiles/${targetUserId}`);

                if (!profileRes.ok) {
                    if (profileRes.status === 404) {
                        setError('User not found');
                    } else {
                        setError('Failed to load user profile');
                    }
                    return;
                }

                const profileData = await profileRes.json();
                setTargetUser(profileData.profile);

                // Check if already following
                const followRes = await fetch(`/api/friends/check?targetUserId=${targetUserId}`);
                if (followRes.ok) {
                    const { isFollowing: following } = await followRes.json();
                    setIsFollowing(following);
                }
            } catch (err) {
                console.error('Error checking follow status:', err);
                setError('Failed to load user information');
            } finally {
                setLoading(false);
            }
        };

        if (user && targetUserId) {
            checkStatus();
        }
    }, [user, authLoading, targetUserId, router]);

    const handleFollow = async () => {
        if (!user) return;

        try {
            const res = await fetch('/api/friends/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to follow user');
            }

            setIsFollowing(true);
        } catch (err) {
            console.error('Error following user:', err);
            alert(err instanceof Error ? err.message : 'Failed to follow user');
        }
    };

    // Loading states
    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !targetUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
                    <p className="text-gray-500 mb-6">{error || 'This user does not exist'}</p>
                    <Link href="/dashboard" className="btn btn-primary w-full">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const displayName = targetUser.full_name?.split(' ')[0] || targetUser.username || 'User';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
                {/* Avatar */}
                {targetUser.avatar_url ? (
                    <img
                        src={targetUser.avatar_url}
                        alt={displayName}
                        className="w-24 h-24 rounded-full mx-auto mb-6 object-cover shadow-md"
                    />
                ) : (
                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                        {displayName[0].toUpperCase()}
                    </div>
                )}

                <h1 className="text-2xl font-bold mb-2">{displayName}</h1>
                {targetUser.username && (
                    <p className="text-gray-400 text-sm mb-2">@{targetUser.username}</p>
                )}
                <p className="text-gray-500 mb-8">invites you to follow their predictions</p>

                {isFollowing ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                            <span>✅</span> You are following {displayName}
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
                        Follow {displayName}
                    </button>
                )}
            </div>
        </div>
    );
}

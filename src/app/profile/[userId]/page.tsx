'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileData {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
    email?: string;
}

/**
 * Public Profile Page
 * Displays a user's public profile with their QR code and follow button.
 * If viewing own profile, shows edit options. If viewing another user, shows follow button.
 */
export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId: profileUserId } = use(params);
    const router = useRouter();
    const { user: currentUser, isLoading: authLoading } = useAuth();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isOwnProfile = currentUser?.id === profileUserId;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch profile data
                const profileRes = await fetch(`/api/profiles/${profileUserId}`);

                if (!profileRes.ok) {
                    if (profileRes.status === 404) {
                        setError('User not found');
                    } else {
                        setError('Failed to load profile');
                    }
                    return;
                }

                const profileData = await profileRes.json();
                setProfile(profileData.profile);

                // Check follow status if logged in and not own profile
                if (currentUser && !isOwnProfile) {
                    const followRes = await fetch(`/api/friends/check?targetUserId=${profileUserId}`);
                    if (followRes.ok) {
                        const { isFollowing: following } = await followRes.json();
                        setIsFollowing(following);
                    }
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (profileUserId) {
            fetchProfile();
        }
    }, [profileUserId, currentUser, isOwnProfile]);

    const handleFollow = async () => {
        if (!currentUser) {
            router.push('/');
            return;
        }

        try {
            const res = await fetch('/api/friends/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUserId: profileUserId })
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

    // Loading state
    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
                    <p className="text-gray-500 mb-6">{error || 'This profile does not exist'}</p>
                    <Link href="/feed" className="btn btn-primary w-full">
                        Go to Feed
                    </Link>
                </div>
            </div>
        );
    }

    const displayName = profile.full_name?.split(' ')[0] || profile.username || 'User';
    const addFriendUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/add-friend/${profileUserId}`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
            <nav className="w-full max-w-md mb-8 flex items-center justify-between">
                <Link href="/feed" className="text-blue-600 font-medium">← Back to Feed</Link>
                <h1 className="font-bold text-lg">Profile</h1>
                <div className="w-20"></div>{/* Spacer */}
            </nav>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-center w-full max-w-sm">
                {/* Avatar */}
                {profile.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        alt={displayName}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover shadow-md border-2 border-gray-100"
                    />
                ) : (
                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                        {displayName[0].toUpperCase()}
                    </div>
                )}

                <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
                {profile.username && (
                    <p className="text-gray-400 text-sm mb-2">@{profile.username}</p>
                )}
                {isOwnProfile && profile.email && (
                    <p className="text-gray-500 text-sm mb-6">{profile.email}</p>
                )}

                {/* QR Code - only show on own profile */}
                {isOwnProfile && (
                    <>
                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-4 mt-6">
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
                            className="btn btn-secondary text-sm px-4 py-2 w-full max-w-xs mb-6"
                        >
                            📋 Copy Profile Link
                        </button>
                    </>
                )}

                {/* Follow Button - only show for other users */}
                {!isOwnProfile && (
                    <div className="mt-6">
                        {!currentUser ? (
                            <Link href="/" className="btn btn-primary w-full py-3">
                                Sign In to Follow
                            </Link>
                        ) : isFollowing ? (
                            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                                <span>✅</span> Following {displayName}
                            </div>
                        ) : (
                            <button
                                onClick={handleFollow}
                                className="btn btn-primary w-full py-3 text-lg shadow-blue-200 shadow-lg"
                            >
                                Follow {displayName}
                            </button>
                        )}
                    </div>
                )}

                {/* Stats */}
                <div className="mt-8 flex justify-center gap-8 text-center border-t border-gray-100 pt-6">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Following</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Followers</div>
                    </div>
                </div>

                {/* Edit Profile - only on own profile */}
                {isOwnProfile && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <Link href="/profile" className="text-sm text-blue-600 hover:underline">
                            Edit Profile Settings →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

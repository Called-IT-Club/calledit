'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import WagerCard from '@/components/wager-card';

interface Friend {
    id: string; // The friendship ID
    friend: {
        id: string;
        username: string;
        full_name: string;
        avatar_url: string;
    };
}

interface Request {
    id: string;
    // For received requests (sender)
    user?: {
        id: string;
        username: string;
        full_name: string;
        avatar_url: string;
    };
    // For sent requests (recipient)
    friend?: {
        id: string;
        username: string;
        full_name: string;
        avatar_url: string;
    };
}

interface Wager {
    id: string;
    challenger_id: string;
    recipient_id: string;
    status: 'pending' | 'accepted' | 'declined' | 'completed';
    terms: string;
    prediction: {
        prediction: string;
    };
    challenger: {
        username: string;
    };
    recipient: {
        username: string;
    };
}

export default function FriendsPage() {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [sentRequests, setSentRequests] = useState<Request[]>([]); // New state
    const [wagers, setWagers] = useState<Wager[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'wagers'>('friends');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (user) {
            fetchFriends();
            fetchWagers();
        }
    }, [user]);

    const fetchFriends = async () => {
        try {
            const res = await fetch('/api/friends');
            const data = await res.json();
            if (data.friends) setFriends(data.friends);
            if (data.requests) setRequests(data.requests);
            if (data.sentRequests) setSentRequests(data.sentRequests);
        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWagers = async () => {
        try {
            const res = await fetch('/api/wagers');
            const data = await res.json();
            if (data.wagers) setWagers(data.wagers);
        } catch (error) {
            console.error('Error fetching wagers:', error);
        }
    };

    const sendRequest = async () => {
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        setMsg('');

        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetEmail: searchQuery }),
            });
            const data = await res.json();
            if (res.ok) {
                setMsg('Friend request sent!');
                setSearchQuery('');
            } else {
                setMsg(data.error || 'Failed to send request');
            }
        } catch (error) {
            setMsg('Error sending request');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleRequest = async (friendshipId: string, status: 'accepted' | 'blocked') => {
        try {
            const res = await fetch('/api/friends', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendshipId, status }),
            });
            if (res.ok) {
                fetchFriends(); // Refresh list
            }
        } catch (error) {
            console.error('Error handling request:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            <main className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Friends & Wagers</h1>

                {/* Add Friend Section */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
                    <h2 className="text-lg font-semibold mb-3">Add a Friend</h2>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Enter email address..."
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            onClick={sendRequest}
                            disabled={searchLoading}
                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {searchLoading ? 'Sending...' : 'Add'}
                        </button>
                    </div>
                    {msg && <p className={`mt-2 text-sm ${msg.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <button
                        className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'friends' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('friends')}
                    >
                        My Friends ({friends.length})
                    </button>
                    <button
                        className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'requests' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Requests ({requests.length})
                    </button>
                    <button
                        className={`px-4 py-3 font-medium whitespace-nowrap ${activeTab === 'wagers' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('wagers')}
                    >
                        Friendly Wagers ({wagers.filter(w => w.status === 'pending').length})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {activeTab === 'friends' && (
                            <>
                                {friends.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No friends yet. Add some above!</p>
                                ) : (
                                    friends.map((f) => (
                                        <div key={f.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                    {f.friend.avatar_url ? (
                                                        <img src={f.friend.avatar_url} alt={f.friend.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                                            {f.friend.username[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{f.friend.full_name || f.friend.username}</p>
                                                    <p className="text-sm text-gray-500">@{f.friend.username}</p>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-red-500 text-sm font-medium">
                                                Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </>
                        )}

                        {activeTab === 'requests' && (
                            <>
                                {/* Received Requests */}
                                {requests.length > 0 && (
                                    <>
                                        <h3 className="font-bold text-gray-500 text-sm uppercase mb-3 px-1">Received</h3>
                                        <div className="space-y-3 mb-6">
                                            {requests.map((r) => (
                                                <div key={r.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                            {r.user?.avatar_url ? (
                                                                <img src={r.user.avatar_url} alt={r.user.username || 'User'} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                                                    {(r.user?.username || '?')[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{r.user?.full_name || r.user?.username}</p>
                                                            <p className="text-sm text-gray-500">wants to be friends</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleRequest(r.id, 'accepted')}
                                                            className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleRequest(r.id, 'blocked')}
                                                            className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                                                        >
                                                            Ignore
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Sent Requests */}
                                {sentRequests.length > 0 && (
                                    <>
                                        <h3 className="font-bold text-gray-500 text-sm uppercase mb-3 px-1">Sent</h3>
                                        <div className="space-y-3">
                                            {sentRequests.map((r) => (
                                                <div key={r.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm opacity-75">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                            {r.friend?.avatar_url ? (
                                                                <img src={r.friend.avatar_url} alt={r.friend.username || 'Friend'} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                                                    {(r.friend?.username || '?')[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{r.friend?.full_name || r.friend?.username}</p>
                                                            <p className="text-sm text-gray-500">Request pending...</p>
                                                        </div>
                                                    </div>
                                                    <button className="text-gray-400 text-sm cursor-not-allowed">
                                                        Pending
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {requests.length === 0 && sentRequests.length === 0 && (
                                    <p className="text-gray-500 text-center py-8">No pending requests.</p>
                                )}
                            </>
                        )}

                        {activeTab === 'wagers' && (
                            <>
                                {wagers.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No active wagers.</p>
                                ) : (
                                    wagers.map((wager) => (
                                        <WagerCard
                                            key={wager.id}
                                            wager={wager}
                                            currentUserId={user?.id || ''}
                                            onUpdate={fetchWagers}
                                        />
                                    ))
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

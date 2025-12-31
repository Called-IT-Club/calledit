'use client';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function AdminDebugPage() {
    const { user, isAdmin, isLoading, refreshRole } = useAuth();
    const [directProfile, setDirectProfile] = useState<any>(null);
    const [loadingDirect, setLoadingDirect] = useState(false);

    const fetchDirect = async () => {
        if (!user) return;
        setLoadingDirect(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        setDirectProfile({ data, error });
        setLoadingDirect(false);
    };

    useEffect(() => {
        if (user) fetchDirect();
    }, [user]);

    const handleFix = async () => {
        if (!confirm("This will force-update your profile to ADMIN using the server key. Proceed?")) return;

        if (!user?.id) {
            alert("No user ID found!");
            return;
        }

        try {
            const res = await fetch('/api/debug/promote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const responseData = await res.json();

            if (!res.ok) {
                console.error("Promote API Error:", responseData);
                alert(`Error ${res.status}: ${responseData.error}\n\nDetails: ${JSON.stringify(responseData.details || responseData, null, 2)}`);
                return;
            }

            alert("Success! You are now an Admin. Refreshing...");
            await refreshRole();
            await fetchDirect();
        } catch (e: any) {
            console.error("Promote exception:", e);
            alert("Error: " + e.message);
        }
    };

    const handleRefresh = async () => {
        await refreshRole();
        await fetchDirect();
    };

    return (
        <div className="p-8 font-mono space-y-8 min-h-screen bg-white">
            <h1 className="text-2xl font-bold">Admin Role Debugger</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: App Context */}
                <div className="border p-6 rounded-xl bg-gray-50 shadow-sm">
                    <h2 className="font-bold text-lg border-b border-gray-200 mb-4 pb-2">1. App Context State</h2>
                    <div className="space-y-2 text-sm">
                        <div>User ID: <span className="font-mono bg-gray-200 px-1 rounded">{user?.id}</span></div>
                        <div>Email: <span className="font-semibold">{user?.email}</span></div>
                        <div className="py-4">
                            <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">isAdmin Flag</div>
                            <div className={`text-4xl font-black ${isAdmin ? "text-green-600" : "text-red-600"}`}>
                                {String(isAdmin)}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => refreshRole()} className="bg-white border hover:bg-gray-50 text-gray-700 px-4 py-2 rounded shadow-sm text-sm font-medium w-full">
                        Try Context Refresh
                    </button>
                    <div className="text-xs text-gray-500 mt-2 text-center">
                        This is what the UI uses to hide/show buttons.
                    </div>
                </div>

                {/* Right: Direct DB */}
                <div className="border p-6 rounded-xl bg-blue-50 shadow-sm border-blue-100">
                    <h2 className="font-bold text-lg border-b border-blue-200 mb-4 pb-2 text-blue-900">2. Real Database State</h2>
                    {loadingDirect ? <div>Fetching...</div> : (
                        <div className="space-y-2 text-sm">
                            <div className="py-4">
                                <div className="text-blue-500 text-xs uppercase font-bold tracking-wider">DB "Role" Column</div>
                                <div className="text-4xl font-black text-blue-900">
                                    {directProfile?.data?.role || 'null'}
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded border border-blue-200 overflow-auto max-h-40">
                                <pre className="text-xs">{JSON.stringify(directProfile, null, 2)}</pre>
                            </div>

                            <button onClick={fetchDirect} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm text-sm font-bold w-full">
                                Re-fetch Database
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Fixer */}
            {directProfile?.data?.role !== 'admin' && (
                <div className="border-t pt-8 mt-8">
                    <h3 className="text-xl font-bold text-red-600 mb-2">⚠️ Role Mismatch Detected</h3>
                    <p className="mb-4">The database says you are NOT an admin.</p>

                    <button
                        onClick={handleFix}
                        className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3 rounded-lg shadow-md font-bold transition-transform transform hover:scale-105"
                    >
                        🛠 FIX MY ACCOUNT NOW
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                        (This runs a secure server script to promote you)
                    </p>
                    <p>Please run this exact Command in your Supabase SQL Editor:</p>
                    <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto mt-2 select-all">
                        UPDATE profiles SET role = 'admin' WHERE id = '{user?.id}';
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function DebugAuthPage() {
    const { user, isAdmin } = useAuth();
    const [syncResult, setSyncResult] = useState<any>(null);

    const handleSync = async () => {
        const res = await fetch('/api/auth/sync-role', { method: 'POST' });
        const data = await res.json();
        setSyncResult(data);

        // Refresh the page to see updated role
        if (data.success) {
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-6">Auth Debug</h1>

                <div className="space-y-4">
                    <div>
                        <h2 className="font-bold text-lg mb-2">Current User:</h2>
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h2 className="font-bold text-lg mb-2">User Metadata:</h2>
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                            {JSON.stringify(user?.user_metadata, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h2 className="font-bold text-lg mb-2">Is Admin:</h2>
                        <p className="text-xl font-bold">{isAdmin ? '✅ YES (ADMIN)' : '❌ NO (USER)'}</p>
                    </div>

                    <div>
                        <h2 className="font-bold text-lg mb-2">Role in Metadata:</h2>
                        <p className="text-xl font-bold">
                            {user?.user_metadata?.role || 'NOT SET'}
                        </p>
                    </div>

                    <button
                        onClick={handleSync}
                        className="btn btn-primary w-full py-3 text-lg"
                    >
                        🔄 Sync Role from Database
                    </button>

                    {syncResult && (
                        <div className="mt-4">
                            <h2 className="font-bold text-lg mb-2">Sync Result:</h2>
                            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                                {JSON.stringify(syncResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

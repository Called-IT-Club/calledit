'use client';

import { useState } from 'react';

interface WagerProps {
    wager: any;
    currentUserId: string;
    onUpdate: () => void;
}

export default function WagerCard({ wager, currentUserId, onUpdate }: WagerProps) {
    const [loading, setLoading] = useState(false);

    // Identify role
    const isChallenger = wager.challenger_id === currentUserId;
    const otherPerson = isChallenger ? wager.recipient : wager.challenger;

    const handleAction = async (status: 'accepted' | 'declined') => {
        setLoading(true);
        try {
            const res = await fetch('/api/wagers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wagerId: wager.id, status }),
            });
            if (res.ok) {
                onUpdate();
            }
        } catch (error) {
            console.error('Error updating wager:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border rounded-xl p-4 shadow-sm mb-3">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">
                    {isChallenger ? 'You challenged' : 'Challenged by'} <span className="text-indigo-600">{otherPerson?.full_name || otherPerson?.username || 'Unknown User'}</span>
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide
          ${wager.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${wager.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
          ${wager.status === 'declined' ? 'bg-red-100 text-red-800' : ''}
          ${wager.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
        `}>
                    {wager.status}
                </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Prediction</p>
                <p className="text-gray-800 italic">"{wager.prediction?.prediction}"</p>
            </div>

            <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase font-semibold">Stakes (Terms)</p>
                <p className="text-gray-900 font-medium">{wager.terms}</p>
            </div>

            {/* Actions only for recipient on pending wagers */}
            {!isChallenger && wager.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                    <button
                        onClick={() => handleAction('accepted')}
                        disabled={loading}
                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Accept Challenge
                    </button>
                    <button
                        onClick={() => handleAction('declined')}
                        disabled={loading}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                        Decline
                    </button>
                </div>
            )}
        </div>
    );
}

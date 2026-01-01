'use client';

import { Prediction, Affiliate } from '@/types';
import { useState } from 'react';
import Link from 'next/link';
import { getCategoryRaw } from '@/config/categories';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/auth/LoginModal';

interface PredictionCardProps {
    prediction: Prediction;
    onUpdateOutcome: (id: string, outcome: 'true' | 'false', evidenceImageUrl?: string) => void;
    onDelete?: (id: string) => void;
    activeAffiliate?: Affiliate;
}

const REACTION_TYPES: Record<string, string> = {
    'like': '❤️',
    'laugh': '😂',
    'fire': '🔥',
    'shock': '😲'
};

const REACTION_LABELS: Record<string, string> = {
    'like': 'Love',
    'laugh': 'Funny',
    'fire': 'Hot Take',
    'shock': 'Shocking'
};

export default function PredictionCard({ prediction, onUpdateOutcome, onDelete, isReadOnly = false, activeAffiliate }: PredictionCardProps & { isReadOnly?: boolean }) {
    const { user } = useAuth();
    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [celebrating, setCelebrating] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    // Optimistic UI state
    const [reactions, setReactions] = useState<Record<string, number>>(prediction.reactions || {});
    const [userReactions, setUserReactions] = useState<string[]>(prediction.userReactions || []);
    const [isBookmarked, setIsBookmarked] = useState(prediction.isBookmarked || false);

    const getCategoryInfo = () => {
        const raw = getCategoryRaw(prediction.category);
        return {
            emoji: raw.emoji,
            label: raw.label,
            // Map the centralized config colors to the Tailwind classes expected by this component
            cardBg: `${raw.colors.bg}/80`, // e.g., bg-sky-50/80
            badge: `bg-white/60 ${raw.colors.text.replace('text-', 'text-')} ${raw.colors.border} hover:bg-white`,
            // Note: raw.colors.text is like 'text-sky-600', we keep it
            btn: raw.colors.text
        };
    };

    const getOutcomeInfo = () => {
        if (prediction.outcome === 'true') {
            return { emoji: '✅', label: 'Came True', color: 'text-green-600 font-bold bg-green-50 px-2 py-1 rounded' };
        } else if (prediction.outcome === 'false') {
            return { emoji: '❌', label: 'Didn\'t Happen', color: 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded' };
        }
        return null; // Don't show anything for Pending
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const categoryInfo = getCategoryInfo();
    const outcomeInfo = getOutcomeInfo();

    const handleMarkTrue = async () => {
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 1000);

        let evidenceUrl: string | undefined;
        if (selectedImage) {
            // Convert to base64
            evidenceUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(selectedImage);
            });
        }

        onUpdateOutcome(prediction.id, 'true', evidenceUrl);
        setShowOutcomeMenu(false);
        setSelectedImage(null);
    };

    const toggleReaction = async (type: string) => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        // Optimistic Update
        const isReacted = userReactions.includes(type);
        const newCount = (reactions[type] || 0) + (isReacted ? -1 : 1);

        setReactions({ ...reactions, [type]: Math.max(0, newCount) });
        setUserReactions(isReacted ? userReactions.filter(r => r !== type) : [...userReactions, type]);

        try {
            const res = await fetch('/api/reactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ predictionId: prediction.id, reactionType: type })
            });

            if (!res.ok) {
                // Determine error message based on response
                const data = await res.json().catch(() => ({}));
                const msg = data.error || 'Failed to update reaction';
                console.error('Reaction API Error:', msg);
                throw new Error(msg);
            }

        } catch (error) {
            console.error('Failed to toggle reaction', error);
            // Revert on failure
            setReactions(reactions);
            setUserReactions(userReactions);
        }
    };

    const toggleBookmark = async () => {
        if (!user) {
            setShowLoginModal(true);
            return;
        }

        // Optimistic
        const newState = !isBookmarked;
        setIsBookmarked(newState);

        try {
            const res = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ predictionId: prediction.id })
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const msg = data.error || 'Failed to update bookmark';
                console.error('Bookmark API Error:', msg);
                throw new Error(msg);
            }
        } catch (error) {
            console.error('Failed to toggle bookmark', error);
            // Revert
            setIsBookmarked(isBookmarked);
        }
    };

    return (
        <div className={`card p-6 fade-in relative ${celebrating ? 'celebrate' : ''} ${categoryInfo.cardBg} border border-gray-100/50 shadow-sm transition-colors duration-300`}>

            {celebrating && (
                <div className="confetti-burst">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti-piece"
                            style={{
                                left: `${50 + Math.random() * 20 - 10}%`,
                                top: '50%',
                                backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
                                animationDelay: `${Math.random() * 0.2}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Header: Author & Date */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {prediction.author && (
                        <Link
                            href={`/profile/${prediction.userId}`}
                            className="flex items-center gap-2 mr-2 hover:opacity-80 transition-opacity group"
                            title={`View ${prediction.author.name}'s profile`}
                        >
                            <img
                                src={prediction.author.avatarUrl || `https://ui-avatars.com/api/?name=${prediction.author.name}&background=random`}
                                alt={prediction.author.name}
                                className="w-8 h-8 rounded-full border border-gray-100 group-hover:border-blue-300 transition-colors"
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-900 leading-none group-hover:text-blue-600 transition-colors">
                                    {prediction.author.name}
                                </span>
                                {prediction.author.username && (
                                    <span className="text-[10px] text-gray-400 leading-none group-hover:text-blue-400 transition-colors">
                                        @{prediction.author.username}
                                    </span>
                                )}
                            </div>
                        </Link>
                    )}

                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider ${categoryInfo.badge}`}>
                        <span>{categoryInfo.emoji}</span>
                        <span>{categoryInfo.label}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* @ts-ignore */}
                    {prediction.is_private && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">🔒 Private</span>
                    )}
                    <div className="text-xs text-gray-400 font-medium tracking-wide">
                        {formatDate(prediction.createdAt)}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative">
                {/* CALLED IT Stamp */}
                {prediction.outcome === 'true' && (
                    <div className="absolute -top-6 -right-2 z-10 transform rotate-12 border-4 border-green-600 rounded px-2 py-0.5 bg-green-50 shadow-lg opacity-90 pointer-events-none mix-blend-multiply">
                        <span className="text-lg font-black text-green-700 uppercase tracking-tighter" style={{ fontFamily: 'Impact, sans-serif' }}>
                            CALLED IT!
                        </span>
                    </div>
                )}

                {/* Prediction Text */}
                <p className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
                    {prediction.prediction}
                </p>

                {/* Evidence Image */}
                {prediction.evidenceImageUrl && (
                    <div className="mb-4 mt-2">
                        <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Evidence</p>
                        <img
                            src={prediction.evidenceImageUrl}
                            alt="Proof"
                            className="w-full max-h-60 object-contain rounded bg-gray-50 border border-gray-100"
                        />
                    </div>
                )}
            </div>

            {/* Footer: Reactions & Actions */}
            <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-50">

                {/* Left: Reactions & Status */}
                <div className="flex flex-col gap-2">
                    {/* Reactions Bar */}
                    <div className="flex items-center gap-1">
                        {Object.entries(REACTION_TYPES).map(([type, emoji]) => {
                            const count = reactions[type] || 0;
                            const isReacted = userReactions.includes(type);

                            return (
                                <button
                                    key={type}
                                    onClick={() => toggleReaction(type)}
                                    className={`
                                        flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all
                                        ${isReacted
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm transform scale-105'
                                            : 'bg-white/50 hover:bg-white text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200 hover:scale-105'}
                                    `}
                                    title={REACTION_LABELS[type] || type}
                                >
                                    <span className={isReacted ? 'scale-110' : ''}>{emoji}</span>
                                    {count > 0 && <span>{count}</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 mt-1">
                        {outcomeInfo && (
                            <span className={`text-xs flex items-center gap-1.5 ${outcomeInfo.color}`}>
                                {outcomeInfo.emoji} {outcomeInfo.label}
                            </span>
                        )}
                        {prediction.targetDate && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                🎯 {formatDate(prediction.targetDate)}
                            </span>
                        )}
                    </div>
                </div>


                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Only show Mark Outcome if NOT ReadOnly and Pending */}
                    {!isReadOnly && prediction.outcome === 'pending' && (
                        <div className="relative">
                            <button
                                onClick={() => setShowOutcomeMenu(!showOutcomeMenu)}
                                className="px-3 py-1.5 bg-white text-gray-700 border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm flex items-center gap-1.5"
                            >
                                <img src="/logo.png" alt="Logo" className="w-4 h-4 object-contain" />
                                Mark Outcome
                            </button>

                            {showOutcomeMenu && (
                                <div className="absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[180px] overflow-hidden">
                                    <div className="px-3 py-2 border-b bg-gray-50">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Attach Proof</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                                            className="mt-1 block w-full text-xs text-gray-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleMarkTrue}
                                        className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-2 text-green-700 text-sm font-bold"
                                    >
                                        ✅ Yes, Came True
                                    </button>
                                    <button
                                        onClick={() => {
                                            onUpdateOutcome(prediction.id, 'false');
                                            setShowOutcomeMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 border-t text-red-700 text-sm font-bold"
                                    >
                                        ❌ No, Failed
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeAffiliate && (
                        <a
                            href={activeAffiliate.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                                fetch('/api/affiliates/track', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ affiliateId: activeAffiliate.id, type: 'click' })
                                }).catch(e => console.error('Track Click Error:', e));
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 transition-colors ${activeAffiliate.color} bg-opacity-10 hover:bg-opacity-20`}
                        >
                            <span>💰</span> {activeAffiliate.label}
                        </a>
                    )}

                    {/* Bookmark Button */}
                    <button
                        onClick={toggleBookmark}
                        className={`p-1.5 transition-all transform hover:scale-110 ${isBookmarked ? 'text-yellow-500 scale-105' : 'text-gray-400 hover:text-yellow-500'}`}
                        title={isBookmarked ? "Remove Bookmark" : "Save Prediction"}
                    >
                        {isBookmarked ? (
                            <svg className="w-6 h-6 fill-current drop-shadow-sm" viewBox="0 0 24 24"><path d="M5 3h14a2 2 0 012 2v16l-7-4.5L7 21V5a2 2 0 01-2-2z" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        )}
                    </button>

                    {/* Share Button */}
                    <Link
                        href={`/share/${prediction.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors hover:scale-110"
                        title="Share"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    </Link>

                    {/* Delete Button / Confirmation */}
                    {onDelete && (
                        showDeleteConfirm ? (
                            <div className="flex items-center bg-red-50 rounded px-1 animate-in slide-in-from-right-2 duration-200">
                                <span className="text-[10px] text-red-800 font-bold mr-2 uppercase">Sure?</span>

                                <button
                                    onClick={() => onDelete(prediction.id)}
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded mr-1"
                                    title="Confirm Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                </button>

                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                                    title="Cancel"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Call"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        )
                    )}
                </div>
            </div>
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                message="Join the club to react and save predictions!"
            />
        </div>
    );
}

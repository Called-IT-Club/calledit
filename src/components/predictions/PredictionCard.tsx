'use client';

import { Prediction } from '@/types';
import { AFFILIATE_LINKS } from '@/config/affiliates';
import { useState } from 'react';
import Link from 'next/link';

interface PredictionCardProps {
    prediction: Prediction;
    onUpdateOutcome: (id: string, outcome: 'true' | 'false', evidenceImageUrl?: string) => void;
}

export default function PredictionCard({ prediction, onUpdateOutcome, isReadOnly = false }: PredictionCardProps & { isReadOnly?: boolean }) {
    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [celebrating, setCelebrating] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const getCategoryInfo = () => {
        const info = {
            'not-on-my-bingo': {
                emoji: '🎯', label: 'Bingo',
                cardBg: 'bg-fuchsia-50/80',
                badge: 'bg-white/60 text-fuchsia-700 border-fuchsia-200 hover:bg-white',
                btn: 'text-fuchsia-600'
            },
            'sports': {
                emoji: '⚽', label: 'Sports',
                cardBg: 'bg-sky-50/80',
                badge: 'bg-white/60 text-sky-700 border-sky-200 hover:bg-white',
                btn: 'text-sky-600'
            },
            'world-events': {
                emoji: '🌍', label: 'World',
                cardBg: 'bg-orange-50/80',
                badge: 'bg-white/60 text-orange-700 border-orange-200 hover:bg-white',
                btn: 'text-orange-600'
            },
            'financial-markets': {
                emoji: '📈', label: 'Finance',
                cardBg: 'bg-emerald-50/80',
                badge: 'bg-white/60 text-emerald-700 border-emerald-200 hover:bg-white',
                btn: 'text-emerald-600'
            },
            'politics': {
                emoji: '🏛️', label: 'Politics',
                cardBg: 'bg-slate-50/80',
                badge: 'bg-white/60 text-slate-700 border-slate-200 hover:bg-white',
                btn: 'text-slate-600'
            },
            'entertainment': {
                emoji: '🎬', label: 'Entmt',
                cardBg: 'bg-rose-50/80',
                badge: 'bg-white/60 text-rose-700 border-rose-200 hover:bg-white',
                btn: 'text-rose-600'
            },
            'technology': {
                emoji: '🤖', label: 'Tech',
                cardBg: 'bg-indigo-50/80',
                badge: 'bg-white/60 text-indigo-700 border-indigo-200 hover:bg-white',
                btn: 'text-indigo-600'
            },
        };
        return info[prediction.category] || info.technology;
    };

    // ... (rest of function)

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

            {/* Header: Category & Date */}
            <div className="flex items-center justify-between mb-3">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider ${categoryInfo.color}`}>
                    <span>{categoryInfo.emoji}</span>
                    <span>{categoryInfo.label}</span>
                </div>
                <div className="text-xs text-gray-400 font-medium tracking-wide">
                    {formatDate(prediction.createdAt)}
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

            {/* Footer: Status & Actions */}
            <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
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

                <div className="flex items-center gap-2">
                    {/* Only show Mark Outcome if NOT ReadOnly and Pending */}
                    {!isReadOnly && prediction.outcome === 'pending' && (
                        <div className="relative">
                            <button
                                onClick={() => setShowOutcomeMenu(!showOutcomeMenu)}
                                className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors shadow-sm"
                            >
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

                    {AFFILIATE_LINKS[prediction.category] && (
                        <a
                            href={AFFILIATE_LINKS[prediction.category]!.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 transition-colors ${AFFILIATE_LINKS[prediction.category]!.color} bg-opacity-10 hover:bg-opacity-20`}
                        >
                            <span>💰</span> {AFFILIATE_LINKS[prediction.category]!.label}
                        </a>
                    )}

                    <Link
                        href={`/share/${prediction.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Share"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

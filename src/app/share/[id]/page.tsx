'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Prediction, User } from '@/types';
import Link from 'next/link';
import { useRef } from 'react';

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const cardRef = useRef<HTMLDivElement>(null);

    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [author, setAuthor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);
    const [isMe, setIsMe] = useState(false);

    // Mock current user
    const currentUserId = 'user-1';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch from API
                const res = await fetch(`/api/predictions/${id}`, { cache: 'no-store' });

                if (!res.ok) {
                    // Try to parse error
                    let errMsg = 'Prediction not found';
                    try { const json = await res.json(); if (json.error) errMsg = json.error; } catch (e) { }
                    throw new Error(errMsg);
                }

                const { prediction: mappedPrediction } = await res.json();

                setPrediction(mappedPrediction);

                // Set Author from mapped prediction (which now includes it)
                if (mappedPrediction.author) {
                    setAuthor({
                        id: mappedPrediction.userId,
                        email: '', // Not strictly needed for display
                        name: mappedPrediction.author.name,
                        provider: 'email',
                        // role: authorData.role // Not exposed by mapper yet, but okay for display
                    });
                } else {
                    setAuthor({ id: mappedPrediction.userId, email: '', name: 'Authenticated', provider: 'email' });
                }

                // 3. Check Protocol
                // To do this strictly "IsMe", we need to know who "I" am.
                // We can get that from client side auth context or just ignore for share page.
                // The original code mocked currentUserId = 'user-1' anyway or checked auth.
                // We'll leave the auth check to a separate useEffect if needed, but for public share it's visual.
                // Let's quickly check auth status purely for the "Edit" button if it existed
                // BUT, the share page is mostly read-only.

                // If we have a user in session, we can check.
                const { data: { user } } = await supabase.auth.getUser();
                if (user && user.id === mappedPrediction.userId) {
                    setIsMe(true);
                }

            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Could not find this prediction'); // Show actual error
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleFollow = async () => {
        // Mock follow for Guest Users
        setIsFollowing(true);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
    );

    if (error || !prediction) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="text-4xl mb-4">😕</div>
            <p className="text-xl font-medium text-gray-900 mb-4">{error}</p>
            <Link href="/" className="btn btn-primary">
                Go Home
            </Link>
        </div>
    );

    const getCategoryTheme = () => {
        const info = {
            'not-on-my-bingo': {
                emoji: '🎯', label: 'Bingo',
                // Updated colors to match Home Page (globals.css)
                cardStyle: { backgroundColor: '#f5f3ff' }, // violet-50
                badgeStyle: { backgroundColor: 'rgba(255, 255, 255, 0.6)', color: '#7c3aed', borderColor: '#8b5cf6' }, // violet-600/500
                gradient: 'from-violet-400 to-purple-600'
            },
            'sports': {
                emoji: '⚽', label: 'Sports',
                cardStyle: { backgroundColor: '#eff6ff' }, // blue-50
                badgeStyle: { backgroundColor: 'rgba(255, 255, 255, 0.6)', color: '#2563eb', borderColor: '#3b82f6' }, // blue-600/500
                gradient: 'from-blue-400 to-indigo-600'
            },
            'world-events': {
                emoji: '🌍', label: 'World',
                cardStyle: { backgroundColor: '#fef2f2' }, // red-50
                badgeStyle: { backgroundColor: 'rgba(255, 255, 255, 0.6)', color: '#dc2626', borderColor: '#ef4444' }, // red-600/500
                gradient: 'from-red-400 to-orange-600'
            },
            'financial-markets': {
                emoji: '📈', label: 'Finance',
                cardStyle: { backgroundColor: '#f0fdf4' }, // green-50
                badgeStyle: { backgroundColor: 'rgba(255, 255, 255, 0.6)', color: '#059669', borderColor: '#10b981' }, // emerald-600/500
                gradient: 'from-emerald-400 to-green-600'
            },
            'politics': {
                emoji: '🏛️', label: 'Politics',
                cardStyle: { backgroundColor: '#f8fafc' }, // slate-50
                badgeStyle: { backgroundColor: 'rgba(255, 255, 255, 0.6)', color: '#334155', borderColor: '#cbd5e1' }, // slate-700
                gradient: 'from-slate-400 to-gray-600'
            },
            'entertainment': {
                emoji: '🎬', label: 'Entmt',
                cardStyle: { backgroundColor: '#fff1f2' }, // rose-50
                badgeStyle: { backgroundColor: 'rgba(255, 255, 255, 0.6)', color: '#be123c', borderColor: '#fda4af' }, // rose-700
                gradient: 'from-rose-400 to-pink-600'
            },
            'technology': {
                emoji: '🤖', label: 'Tech',
                cardStyle: { backgroundColor: '#eef2ff' }, // indigo-50
                badgeStyle: { backgroundColor: 'rgba(255, 255, 255, 0.6)', color: '#4338ca', borderColor: '#a5b4fc' }, // indigo-700
                gradient: 'from-indigo-400 to-violet-600'
            },
        };
        return info[prediction.category] || info.technology;
    };

    const theme = getCategoryTheme();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleDownloadImage = async () => {
        if (!cardRef.current) return;

        try {
            // Dynamically import html2canvas (Handle both ESM and CJS)
            const mod = await import('html2canvas');
            const html2canvas = mod.default || mod;

            // @ts-ignore - html2canvas has some typing issues with dynamic imports sometimes
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                logging: true, // DEBUG: Enabled logging
                allowTaint: true, // Allow taint just in case, though useCORS is better
                proxy: undefined,
            });

            // Convert to Blob for sharing
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error('Could not generate image blob');

            // Detect Mobile Device (Simple check)
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            // If Mobile, try native share first (better for saving to Photos)
            if (isMobile && navigator.canShare) {
                const file = new File([blob], `called-it-${prediction?.id}.png`, { type: 'image/png' });
                const shareData = {
                    files: [file],
                    title: 'Called It Prediction',
                };
                if (navigator.canShare(shareData)) {
                    try {
                        await navigator.share(shareData);
                        return;
                    } catch (shareError) {
                        console.warn('Native share failed, falling back to download', shareError);
                    }
                }
            }

            // Default / Desktop: Force Download
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `called-it-${prediction?.id}.png`;
            link.click();

        } catch (err: any) {
            console.error("Export failed", err);
            alert(`Could not generate image: ${err?.message || "Unknown error"}. Try screenshotting.`);
        }
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Called It',
                    text: `See what ${author?.name || 'someone'} called!`,
                    url: `${window.location.href}?`,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(`${window.location.href}?`);
            alert('Link copied to clipboard!');
        }
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50"
            style={{ backgroundColor: '#f9fafb' }}>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[540px]">
                {/* The Share Card - Designed for Screenshots (1080x1350px @ 2x) */}
                <div className="w-full relative group transition-transform hover:scale-[1.01]">
                    {/* Ambient Glow - OMITTED from ref so it doesn't break html2canvas */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${theme.gradient} rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000`}></div>

                    <div ref={cardRef} className="relative rounded-2xl overflow-hidden text-center aspect-[4/5] flex flex-col justify-between"
                        style={{
                            ...theme.cardStyle,
                            color: '#111827', // Explicitly set text color to block inherited 'lab' colors from body
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            border: '1px solid #f3f4f6'
                        }}
                    >

                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-[0.03]"
                            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                        </div>

                        {/* Top Bar: Brand & Category */}
                        <div className="relative z-10 p-8 flex justify-between items-start">
                            <div className="text-left">
                                <Link href="/" className="font-black italic tracking-tighter text-xl no-underline block" style={{ color: '#1e40af' }}>
                                    CALLED IT!
                                </Link>
                                <div className="text-xs font-medium tracking-wide mt-1" style={{ color: '#6b7280' }}>
                                    Join the Club. Make the Call.
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider"
                                style={{
                                    ...theme.badgeStyle,
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                }}>
                                <span className="text-sm">{theme.emoji}</span>
                                {theme.label}
                            </div>
                        </div>

                        {/* Main Content: Prediction */}
                        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 pb-8">
                            {/* Giant Quote Mark */}
                            <div className="text-6xl font-serif leading-none mb-4" style={{ color: '#f3f4f6' }}>“</div>

                            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-balance tracking-tight" style={{ color: '#111827' }}>
                                {prediction.prediction}
                            </h1>

                            {/* Giant Quote Mark End */}
                            <div className="text-6xl font-serif leading-none mt-4" style={{ color: '#f3f4f6' }}>”</div>
                        </div>

                        {/* Status / Outcome */}
                        {prediction.outcome === 'true' && (
                            <div className="relative z-10 mb-8 animate-bounce">
                                <span className="inline-block px-5 py-2 rounded-full font-black text-xl transform -rotate-2"
                                    style={{
                                        backgroundColor: '#22c55e',
                                        color: '#ffffff',
                                        border: '2px solid #ffffff',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                    }}>
                                    ✅ CAALLLLEDD IT!!!
                                </span>
                            </div>
                        )}

                        {prediction.outcome === 'false' && (
                            <div className="relative z-10 mb-8">
                                <span className="inline-block px-5 py-2 rounded-full font-bold"
                                    style={{
                                        backgroundColor: '#fee2e2',
                                        color: '#dc2626',
                                        border: '1px solid #fecaca'
                                    }}>
                                    ❌ Missed it
                                </span>
                            </div>
                        )}

                        {/* Evidence Image */}
                        {prediction.evidenceImageUrl && (
                            <div className="relative z-10 mb-8 px-8">
                                <img
                                    src={prediction.evidenceImageUrl}
                                    alt="Evidence"
                                    crossOrigin="anonymous"
                                    className="w-full max-h-64 object-contain rounded-lg mx-auto"
                                    style={{
                                        border: '1px solid #f3f4f6',
                                        backgroundColor: '#f9fafb',
                                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                    }}
                                />
                            </div>
                        )}

                        {/* Footer Data */}
                        <div className="relative z-10 border-t"
                            style={{
                                backgroundColor: '#f9fafb',
                                borderTop: '1px solid #f3f4f6'
                            }}>
                            <div className="p-6 pb-2 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                        style={{
                                            backgroundColor: '#ffffff',
                                            color: '#4b5563',
                                            border: '1px solid #e5e7eb',
                                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                        }}>
                                        {/* Avatar or Initials */}
                                        {author?.avatarUrl ? (
                                            <img
                                                src={author.avatarUrl}
                                                alt={author.name}
                                                // crossOrigin="anonymous" // IMPORTANT for html2canvas to not taint!
                                                // Actually, crossOrigin needs to be on the img tag if loading from external source
                                                // But Supabase storage / External URLs need CORS headers.
                                                // Adding crossOrigin="anonymous" here is good practice if server supports it.
                                                crossOrigin="anonymous"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            author?.name?.[0]
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold" style={{ color: '#111827' }}>{author?.name || 'User'}</div>
                                        <div className="text-xs" style={{ color: '#6b7280' }}>{formatDate(prediction.createdAt)}</div>
                                    </div>
                                </div>

                                {prediction.targetDate && (
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>Target Date</div>
                                        <div className="font-bold" style={{ color: '#374151' }}>{formatDate(prediction.targetDate)}</div>
                                    </div>
                                )}
                            </div>

                            {/* Copyright (Bottom Center) */}
                            <div className="pb-4 text-center opacity-40">
                                <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: '#6b7280' }}>
                                    © {new Date().getFullYear()} Called It!
                                </span>
                            </div>
                        </div>

                        {/* Follow Button Action (moved outside card or kept if interactive) */}
                    </div>
                </div>

                {/* Action Icons Bar */}
                <div className="mt-8 flex items-center justify-center gap-3 w-full max-w-full overflow-x-auto px-4 pb-4 scrollbar-hide">

                    {/* 1. Save (Primary - Dark) */}
                    <button onClick={handleDownloadImage} title="Save Image"
                        className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:scale-110 hover:-translate-y-1 transition-all">
                        <span className="text-xl">📸</span>
                    </button>

                    {/* 2. Share Link - White/Gray */}
                    <button onClick={handleNativeShare} title="Share Link"
                        className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-white text-gray-700 border border-gray-200 shadow-sm hover:scale-110 hover:-translate-y-1 transition-all">
                        <span className="text-xl">🔗</span>
                    </button>

                    {/* 3. Pinterest - White/Red */}
                    <button title="Pin It"
                        onClick={() => {
                            const url = encodeURIComponent(`${window.location.href}?`);
                            const media = encodeURIComponent(`${window.location.origin}/share/${id}/image`);
                            const description = encodeURIComponent(`Check out my prediction on Called It: ${prediction?.prediction}`);
                            window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank');
                        }}
                        className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-white text-[#E60023] border border-gray-200 shadow-sm hover:scale-110 hover:-translate-y-1 transition-all">
                        <span className="text-xl font-bold">P</span>
                    </button>

                    {/* 4. Facebook - White/Blue */}
                    <button title="Share on Facebook"
                        onClick={() => {
                            const url = encodeURIComponent(`${window.location.href}?`);
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                        }}
                        className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-white text-[#1877F2] border border-gray-200 shadow-sm hover:scale-110 hover:-translate-y-1 transition-all">
                        <span className="text-xl font-bold">f</span>
                    </button>



                    {/* 6. Email - White/Gray */}
                    <button title="Share via Email"
                        onClick={() => {
                            const subject = encodeURIComponent("Check out this prediction on Called It!");
                            const body = encodeURIComponent(`I made a prediction: "${prediction?.prediction}"\n\nSee if I called it here: ${window.location.href}?`);
                            window.location.href = `mailto:?subject=${subject}&body=${body}`;
                        }}
                        className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-white text-gray-600 border border-gray-200 shadow-sm hover:scale-110 hover:-translate-y-1 transition-all">
                        <span className="text-xl">✉️</span>
                    </button>

                    {/* 7. SMS - White/Green */}
                    <button title="Send via Text"
                        onClick={() => {
                            const body = encodeURIComponent(`Check out this prediction: ${window.location.href}?`);
                            window.location.href = `sms:?&body=${body}`;
                        }}
                        className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-white text-green-600 border border-gray-200 shadow-sm hover:scale-110 hover:-translate-y-1 transition-all">
                        <span className="text-xl">💬</span>
                    </button>
                </div>

                {/* Helper Text */}
                <div className="mt-4 text-xs text-gray-400 font-medium tracking-wide pb-8">
                    TAP TO SHARE PREDICTION
                </div>
            </main>
        </div>
    );
}

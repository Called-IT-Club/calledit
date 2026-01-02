'use client';

import { use, useEffect, useState } from 'react';

import { Prediction, User } from '@/types';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { useRef } from 'react';
import { getCategoryRaw } from '@/config/categories';

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const cardRef = useRef<HTMLDivElement>(null);

    // Construct Share URL for QR Code
    const [shareUrl, setShareUrl] = useState('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShareUrl(`${window.location.origin}/share/${id}`);
        }
    }, [id]);

    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [author, setAuthor] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                        avatarUrl: mappedPrediction.author.avatarUrl
                        // role: authorData.role // Not exposed by mapper yet, but okay for display
                    });
                } else {
                    setAuthor({ id: mappedPrediction.userId, email: '', name: 'Authenticated', provider: 'email' });
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
        const raw = getCategoryRaw(prediction.category);
        return {
            emoji: raw.emoji,
            label: raw.label,
            cardStyle: { backgroundColor: raw.share.cardBg },
            badgeStyle: {
                backgroundColor: raw.share.badge.bg,
                color: raw.share.badge.text,
                borderColor: raw.share.badge.border
            },
            gradient: raw.share.gradient
        };
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
                        <div className="relative z-10 p-6 flex justify-between items-center border-b"
                            style={{
                                backgroundColor: '#f9fafb',
                                borderBottom: '1px solid #f3f4f6'
                            }}>
                            <div className="flex items-center gap-3 text-left">
                                <div className="p-1.5 rounded-lg shadow-sm border flex items-center justify-center"
                                    style={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6' }}>
                                    {shareUrl ? (
                                        <QRCode
                                            value={shareUrl}
                                            size={64}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                            fgColor="#111827"
                                            bgColor="#ffffff"
                                        />
                                    ) : (
                                        <div className="w-[64px] h-[64px] bg-gray-100 animate-pulse rounded"></div>
                                    )}
                                </div>
                                <div>
                                    <Link href="/" className="font-black italic tracking-tighter text-xl no-underline block leading-none pt-1" style={{ color: '#1e40af' }}>
                                        CALLED IT!
                                    </Link>
                                    <div className="text-[10px] font-bold tracking-widest mt-0.5 uppercase" style={{ color: '#9ca3af' }}>
                                        Make the Call
                                    </div>
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
                        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-12 pb-8">
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight text-balance tracking-tight" style={{ color: '#111827' }}>
                                <span className="text-5xl font-serif opacity-20 align-top mr-1" style={{ color: theme.badgeStyle.color }}>“</span>
                                {prediction.prediction}
                                <span className="text-5xl font-serif opacity-20 align-bottom ml-1" style={{ color: theme.badgeStyle.color }}>”</span>
                            </h1>
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
                            const media = encodeURIComponent(`${window.location.origin}/api/og?id=${id}`);
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
                <div className="mt-4 text-xs text-gray-400 font-medium tracking-wide pb-4">
                    TAP TO SHARE PREDICTION
                </div>

                {/* Open App / Conversion CTAs */}
                <div className="flex flex-col gap-3 w-full max-w-[320px] pb-8 animate-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
                    <Link
                        href="/"
                        className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
                    >
                        <span>🚀</span> Make A Call
                    </Link>

                    <Link
                        href="/feed"
                        className="w-full py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <span>👀</span> Live Feed
                    </Link>
                </div>
            </main>
        </div>
    );
}

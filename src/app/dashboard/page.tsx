'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import PredictionCard from '@/components/predictions/PredictionCard';
import SponsoredCard from '@/components/ads/SponsoredCard';
import PredictionForm from '@/components/predictions/PredictionForm';
import CategoryTabs from '@/components/predictions/CategoryTabs';
import { Prediction, Advertisement, Affiliate, PredictionCategory } from '@/types';

export default function DashboardPage() {
    const { user, signInWithGoogle } = useAuth();
    const searchParams = useSearchParams();

    // State Definitions
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
    const [selectedCategory, setSelectedCategory] = useState<PredictionCategory | 'all'>('all');
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [affiliates, setAffiliates] = useState<Record<string, Affiliate>>({});

    // Check for auto-open param
    useEffect(() => {
        if (searchParams.get('new_call') === 'true') {
            setShowForm(true);
        }
    }, [searchParams]);

    // Filter Logic
    const filteredPredictions = useMemo(() => selectedCategory === 'all'
        ? predictions
        : predictions.filter(p => p.category === selectedCategory), [selectedCategory, predictions]);

    // Mix Logic (Ads + Predictions)
    const mixedItems = useMemo(() => filteredPredictions.reduce<(Prediction | { type: 'ad', data: Advertisement })[]>((acc, curr, index) => {
        acc.push(curr);
        // Inject Ad after first item (index 0 - making it 2nd) and then every 5 items
        if (ads.length > 0 && index % 5 === 0) {
            // cycle through ads
            const adIndex = (index / 5) % ads.length;
            acc.push({ type: 'ad', data: ads[adIndex] });
        }
        return acc;
    }, []), [filteredPredictions, ads]);

    // Reset index when items change
    useEffect(() => {
        if (currentCardIndex >= mixedItems.length) {
            setCurrentCardIndex(0);
        }
    }, [mixedItems.length]);


    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (viewMode !== 'cards') return;

            if (e.key === 'ArrowLeft') {
                setCurrentCardIndex(prev => Math.max(0, prev - 1));
            } else if (e.key === 'ArrowRight') {
                setCurrentCardIndex(prev => Math.min(mixedItems.length - 1, prev + 1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode, mixedItems.length]);

    // Fetch Ads
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const res = await fetch('/api/ads');
                if (res.ok) {
                    const { ads: adsData } = await res.json();
                    setAds(adsData || []);
                }
            } catch (err) {
                console.error("Failed to fetch ads", err);
            }
        };


        const fetchAffiliates = async () => {
            try {
                const res = await fetch('/api/affiliates');
                if (res.ok) {
                    const { affiliates: data } = await res.json();
                    const map: Record<string, Affiliate> = {};
                    (data || []).forEach((a: Affiliate) => {
                        if (a.category) map[a.category] = a;
                    });
                    setAffiliates(map);
                }
            } catch (e) {
                console.error('Failed to fetch affiliates', e);
            }
        };

        fetchAds();
        fetchAffiliates();
    }, []);

    // Fetch Predictions when User is ready
    useEffect(() => {
        const fetchPredictions = async () => {
            try {
                if (!user) return; // Wait for user

                const res = await fetch('/api/dashboard');

                if (!res.ok) {
                    if (res.status === 401) return; // session might be refreshing
                    throw new Error('Failed to fetch dashboard data');
                }

                const { predictions: userPredictions } = await res.json();

                if (userPredictions) {
                    setPredictions(userPredictions);
                }
            } catch (error) {
                console.error('Failed to fetch predictions:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPredictions();
        } else {
            // If no user after a short delay, stop loading so we can show login
            const timer = setTimeout(() => {
                setLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleNewPrediction = async (prediction: any) => {
        try {
            if (!user) {
                alert('Please sign in to make a call');
                return;
            }

            const res = await fetch('/api/predictions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prediction)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create prediction');
            }

            const { prediction: newPred } = await res.json();
            setPredictions([newPred, ...predictions]);
            setShowForm(false);

        } catch (error: any) {
            console.error('Failed to create call:', error);
            alert(`Error saving prediction: ${error.message || 'Unknown error'}`);
        }
    };

    const handleUpdateOutcome = async (id: string, outcome: 'true' | 'false', evidenceImageUrl?: string) => {
        try {
            const updates: any = { id, outcome };
            if (evidenceImageUrl) {
                updates.evidenceImageUrl = evidenceImageUrl;
            }

            const res = await fetch('/api/predictions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update prediction');
            }

            setPredictions(predictions.map(p =>
                p.id === id ? { ...p, outcome, evidenceImageUrl: evidenceImageUrl || p.evidenceImageUrl } : p
            ));
        } catch (error) {
            console.error('Failed to update prediction:', error);
        }
    };

    const handleDeleteCall = async (id: string) => {
        // Confirmed via UI
        try {
            const res = await fetch(`/api/predictions?id=${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to delete');
            }

            setPredictions(predictions.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete call:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {!loading && !user ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
                            <p className="text-gray-500 mb-8">
                                You need to be signed in to view your calls and make new predictions.
                            </p>
                            <button
                                onClick={() => signInWithGoogle()}
                                className="w-full btn bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all hover:shadow-md"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                                <span>Sign in with Google</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Action Bar */}
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tighter text-gray-900">
                                    MY CALLS
                                </h1>
                                <p className="text-gray-500 font-medium text-sm mt-1">
                                    Track your legacy, Oracle.
                                </p>
                            </div>
                        </div>

                        {/* Prediction Form */}
                        {showForm && (
                            <div className="mb-6 fade-in">
                                <PredictionForm
                                    onSubmit={handleNewPrediction}
                                    onCancel={() => setShowForm(false)}
                                />
                            </div>
                        )}

                        {/* Category Tabs */}
                        <CategoryTabs
                            selected={selectedCategory}
                            onSelect={setSelectedCategory}
                        />

                        {/* View Toggles & List */}
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading predictions...</div>
                        ) : filteredPredictions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">🔮</div>
                                <p className="text-gray-600">
                                    No predictions yet. Make your first call!
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* View Toggle */}
                                <div className="flex justify-end mb-4">
                                    <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                                                ? 'bg-white shadow-sm text-gray-900'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            📋 List
                                        </button>
                                        <button
                                            onClick={() => setViewMode('cards')}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'cards'
                                                ? 'bg-white shadow-sm text-gray-900'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            🃏 Cards
                                        </button>
                                    </div>
                                </div>

                                {viewMode === 'list' ? (
                                    /* List View */
                                    <div className="space-y-4">
                                        {mixedItems.map((item, index) => (
                                            <div key={'id' in item ? item.id : `mixed-${index}`}>
                                                {'type' in item && item.type === 'ad' ? (
                                                    <SponsoredCard ad={(item as any).data} />
                                                ) : (
                                                    <PredictionCard
                                                        prediction={item as Prediction}
                                                        onUpdateOutcome={handleUpdateOutcome}
                                                        onDelete={handleDeleteCall}
                                                        activeAffiliate={affiliates[(item as Prediction).category]}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* Focus Mode View (One Card at a Time) */
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="relative w-full max-w-md">
                                            {/* Card Container */}
                                            <div className="transition-all duration-300 transform">
                                                {'type' in mixedItems[currentCardIndex] && (mixedItems[currentCardIndex] as any).type === 'ad' ? (
                                                    <SponsoredCard ad={(mixedItems[currentCardIndex] as any).data} />
                                                ) : (
                                                    <PredictionCard
                                                        prediction={mixedItems[currentCardIndex] as Prediction}
                                                        onUpdateOutcome={handleUpdateOutcome}
                                                        onDelete={handleDeleteCall}
                                                        activeAffiliate={affiliates[(mixedItems[currentCardIndex] as Prediction).category]}
                                                    />
                                                )}
                                            </div>

                                            {/* Navigation Controls (Overlay or Side) */}
                                            <div className="flex items-center justify-between mt-6 px-4">
                                                <button
                                                    onClick={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
                                                    disabled={currentCardIndex === 0}
                                                    className="btn btn-secondary rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    ←
                                                </button>

                                                <span className="text-sm font-medium text-gray-500">
                                                    {currentCardIndex + 1} / {mixedItems.length}
                                                </span>

                                                <button
                                                    onClick={() => setCurrentCardIndex(prev => Math.min(mixedItems.length - 1, prev + 1))}
                                                    disabled={currentCardIndex === mixedItems.length - 1}
                                                    className="btn btn-secondary rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    →
                                                </button>
                                            </div>

                                            {/* Keyboard Hint */}
                                            <p className="text-center text-xs text-gray-400 mt-4">
                                                Tip: Use arrow keys to navigate
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main >
        </div >
    );
}

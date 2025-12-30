'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { mapPrediction } from '@/lib/mappers';
import { Prediction, PredictionCategory } from '@/types';
import CategoryTabs from '@/components/predictions/CategoryTabs';
import PredictionCard from '@/components/predictions/PredictionCard';
import PredictionForm from '@/components/predictions/PredictionForm';
import LoginButton from '@/components/auth/LoginButton';
import SponsoredCard from '@/components/ads/SponsoredCard';
import Link from 'next/link';
import Header from '@/components/layout/Header';

export default function DashboardPage() {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<PredictionCategory | 'all'>('all');
    const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    const filteredPredictions = selectedCategory === 'all'
        ? predictions
        : predictions.filter(p => p.category === selectedCategory);

    const mixedItems = filteredPredictions.reduce<(Prediction | { type: 'ad', id: string })[]>((acc, curr, index) => {
        acc.push(curr);
        // Inject Ad every 3 items
        if ((index + 1) % 3 === 0) {
            acc.push({ type: 'ad', id: `ad-${index}` });
        }
        return acc;
    }, []);

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

    const { user } = useAuth();

    // ... existing navigation useEffects ...

    useEffect(() => {
        if (user) {
            fetchPredictions();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchPredictions = async () => {
        try {
            if (!user) return;

            const { data, error } = await supabase
                .from('predictions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) {
                setPredictions(data.map(mapPrediction));
            }
        } catch (error) {
            console.error('Failed to fetch predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewPrediction = async (prediction: Partial<Prediction>) => {
        try {
            if (!user) {
                alert('Please sign in to make a prediction');
                return;
            }

            const { data, error } = await supabase
                .from('predictions')
                .insert([{
                    user_id: user.id,
                    category: prediction.category,
                    prediction: prediction.prediction,
                    target_date: prediction.targetDate,
                    meta: prediction.meta
                }])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                const newPred = mapPrediction(data);
                setPredictions([newPred, ...predictions]);
                setShowForm(false);
            }
        } catch (error) {
            console.error('Failed to create prediction:', error);
        }
    };

    const handleUpdateOutcome = async (id: string, outcome: 'true' | 'false', evidenceImageUrl?: string) => {
        try {
            const updates: any = { outcome };
            if (evidenceImageUrl) {
                updates.evidence_image_url = evidenceImageUrl;
            }

            const { error } = await supabase
                .from('predictions')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            setPredictions(predictions.map(p =>
                p.id === id ? { ...p, outcome, evidenceImageUrl: evidenceImageUrl || p.evidenceImageUrl } : p
            ));
        } catch (error) {
            console.error('Failed to update prediction:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Action Bar */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">My Predictions</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-primary"
                    >
                        {showForm ? 'Cancel' : '+ New Prediction'}
                    </button>
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
                    counts={{
                        all: predictions.length,
                        'not-on-my-bingo': predictions.filter(p => p.category === 'not-on-my-bingo').length,
                        'sports': predictions.filter(p => p.category === 'sports').length,
                        'world-events': predictions.filter(p => p.category === 'world-events').length,
                        'financial-markets': predictions.filter(p => p.category === 'financial-markets').length,
                        'politics': predictions.filter(p => p.category === 'politics').length,
                        'entertainment': predictions.filter(p => p.category === 'entertainment').length,
                        'technology': predictions.filter(p => p.category === 'technology').length,
                    }}
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
                                {mixedItems.map((item) => (
                                    <div key={'id' in item ? item.id : item.id}>
                                        {'type' in item && item.type === 'ad' ? (
                                            <SponsoredCard />
                                        ) : (
                                            <PredictionCard
                                                prediction={item as Prediction}
                                                onUpdateOutcome={handleUpdateOutcome}
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
                                            <SponsoredCard />
                                        ) : (
                                            <PredictionCard
                                                prediction={mixedItems[currentCardIndex] as Prediction}
                                                onUpdateOutcome={handleUpdateOutcome}
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
            </main >
        </div >
    );
}

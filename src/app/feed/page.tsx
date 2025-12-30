'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Prediction, PredictionCategory } from '@/types';
import CategoryTabs from '@/components/predictions/CategoryTabs';
import PredictionCard from '@/components/predictions/PredictionCard';
import Link from 'next/link';
import Header from '@/components/layout/Header';

import { mapPrediction } from '@/lib/mappers';

const PAGE_SIZE = 20;

export default function LiveFeedPage() {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<PredictionCategory | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // For Infinite Scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastPredictionElementRef = useCallback((node: HTMLDivElement) => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    // 1. Fetch Initial Data
    useEffect(() => {
        const fetchInitialData = async () => {
            // Safety timeout (10s) to handle Supabase cold starts
            const timer = setTimeout(() => {
                console.warn('Feed fetch timed out');
                setLoading(false);
            }, 10000);

            try {
                console.log('Fetching feed data from API...');
                const res = await fetch(`/api/feed?limit=${PAGE_SIZE}`);

                if (!res.ok) throw new Error('Failed to fetch feed');

                const { predictions: newPredictions } = await res.json();

                if (newPredictions) {
                    console.log('Feed data received:', newPredictions.length);
                    setPredictions(newPredictions);
                    if (newPredictions.length < PAGE_SIZE) setHasMore(false);
                }
            } catch (err) {
                console.error('Error fetching feed:', err);
                // alert('Error loading feed. Check console.');
            } finally {
                clearTimeout(timer);
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Load More Function (Cursor Pagination)
    const loadMore = async () => {
        if (loadingMore || !hasMore || predictions.length === 0) return;
        setLoadingMore(true);

        const lastItem = predictions[predictions.length - 1];
        // Ensure lastItem is valid before accessing createdAt
        if (!lastItem?.createdAt) {
            setLoadingMore(false);
            return;
        }

        try {
            const res = await fetch(`/api/feed?limit=${PAGE_SIZE}&cursor=${encodeURIComponent(lastItem.createdAt)}`);

            if (!res.ok) throw new Error('Failed to load more');

            const { predictions: newItems } = await res.json();

            if (newItems && newItems.length > 0) {
                setPredictions(prev => [...prev, ...newItems]);
                if (newItems.length < PAGE_SIZE) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error loading more:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    // 2. Realtime Subscription (New Items at Top)
    useEffect(() => {
        const channel = supabase
            .channel('live-predictions')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'predictions'
                },
                async (payload) => {
                    // Fetch full data with profile
                    const { data } = await supabase
                        .from('predictions')
                        .select('*, profiles(*)')
                        .eq('id', payload.new.id)
                        .single();

                    if (data) {
                        const newPrediction = mapPrediction(data);
                        setPredictions(prev => [newPrediction, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredPredictions = selectedCategory === 'all'
        ? predictions
        : predictions.filter(p => p.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <CategoryTabs
                        selected={selectedCategory}
                        onSelect={setSelectedCategory}
                        counts={{
                            all: predictions.length, // Note: This shows loaded count only
                            'not-on-my-bingo': predictions.filter(p => p.category === 'not-on-my-bingo').length,
                            'sports': predictions.filter(p => p.category === 'sports').length,
                            'world-events': predictions.filter(p => p.category === 'world-events').length,
                            'financial-markets': predictions.filter(p => p.category === 'financial-markets').length,
                            'politics': predictions.filter(p => p.category === 'politics').length,
                            'entertainment': predictions.filter(p => p.category === 'entertainment').length,
                            'technology': predictions.filter(p => p.category === 'technology').length,
                        }}
                    />
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Connecting to feed...</div>
                ) : (
                    <div className="space-y-4">
                        {filteredPredictions.map((prediction, index) => {
                            // Attach ref to the last element of the list to trigger loadMore
                            const isLast = index === filteredPredictions.length - 1;
                            return (
                                <div
                                    key={prediction.id}
                                    className="animate-fade-in-down"
                                    ref={isLast ? lastPredictionElementRef : null}
                                >
                                    <PredictionCard
                                        prediction={prediction}
                                        onUpdateOutcome={() => { }} // Read-only in feed for now
                                        isReadOnly={true}
                                    />
                                </div>
                            );
                        })}

                        {/* Loading State for Infinite Scroll */}
                        {loadingMore && (
                            <div className="text-center py-4 text-gray-500 text-sm animate-pulse">
                                Loading more predictions...
                            </div>
                        )}

                        {!hasMore && filteredPredictions.length > 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                You've reached the end of history.
                            </div>
                        )}

                        {filteredPredictions.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                Waiting for predictions in this category...
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

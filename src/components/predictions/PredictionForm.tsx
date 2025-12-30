'use client';

import { useState } from 'react';
import { PredictionCategory } from '@/types';

interface PredictionFormProps {
    onSubmit: (prediction: {
        prediction: string;
        category: PredictionCategory;
        targetDate?: string;
    }) => void;
    onCancel: () => void;
}

export default function PredictionForm({ onSubmit, onCancel }: PredictionFormProps) {
    const [isPrivate, setIsPrivate] = useState(false);

    const [prediction, setPrediction] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiCategory, setAiCategory] = useState<PredictionCategory | null>(null);
    const [aiMeta, setAiMeta] = useState<any>(null);

    const analyzePrediction = async () => {
        if (!prediction.trim()) return;

        setIsAnalyzing(true);
        try {
            // Call the shared API route for analysis
            const response = await fetch('/api/predictions/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: prediction }),
            });

            const result = await response.json();
            if (result.category) {
                setAiCategory(result.category);
                setAiMeta({
                    tags: result.tags,
                    entities: result.entities,
                    confidence: result.confidence
                });
                if (result.targetDate) {
                    setTargetDate(result.targetDate);
                }
            }
        } catch (error) {
            console.error('AI Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getCategoryInfo = (cat: PredictionCategory) => {
        const map: Record<PredictionCategory, { label: string; emoji: string }> = {
            'sports': { label: 'Sports', emoji: '⚽' },
            'financial-markets': { label: 'Finance', emoji: '📈' },
            'politics': { label: 'Politics', emoji: '⚖️' },
            'world-events': { label: 'World', emoji: '🌍' },
            'entertainment': { label: 'Entertainment', emoji: '🎬' },
            'technology': { label: 'Tech', emoji: '💻' },
            'not-on-my-bingo': { label: 'Bingo', emoji: '🎲' }
        };
        return map[cat] || { label: 'Other', emoji: '❓' };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prediction.trim() || !aiCategory) return;

        onSubmit({
            prediction: prediction.trim(),
            category: aiCategory,
            targetDate: targetDate || undefined,
            meta: aiMeta || undefined,
            isPrivate,
        });

        // Reset form
        setPrediction('');
        setTargetDate('');
        setAiCategory(null);
        setAiMeta(null);
        setIsPrivate(false);
    };

    // ... existing helper functions ...

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Make a Call (AI Powered)</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Prediction Input */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">
                            What is your call?
                        </label>
                        <button
                            type="button"
                            onClick={analyzePrediction}
                            disabled={!prediction || isAnalyzing}
                            className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                            {isAnalyzing ? (
                                <>
                                    <span className="animate-spin">✨</span> Thinking...
                                </>
                            ) : (
                                <>
                                    ✨ Auto-Detect
                                </>
                            )}
                        </button>
                    </div>
                    <textarea
                        value={prediction}
                        onChange={(e) => setPrediction(e.target.value)}
                        placeholder="e.g., The Lakers will win the NBA championship"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        required
                        maxLength={280}
                    />
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">
                            Use the Auto-Detect button to let AI fill in the details!
                        </p>
                        <span className={`text-xs font-medium ${prediction.length >= 260 ? 'text-red-500' : 'text-gray-400'}`}>
                            {prediction.length}/280
                        </span>
                    </div>
                </div>

                {/* AI Meta Display (Tags & Entities) */}
                {aiMeta && (
                    <div className="fade-in bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-wrap gap-2 text-xs">
                            {aiMeta.entities?.map((entity: string) => (
                                <span key={entity} className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
                                    🏛 {entity}
                                </span>
                            ))}
                            {aiMeta.tags?.map((tag: string) => (
                                <span key={tag} className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                            {aiMeta.confidence && (
                                <span className="text-gray-400 ml-auto flex items-center">
                                    Confidence: {Math.round(aiMeta.confidence * 100)}%
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* AI Category Detection */}
                {isAnalyzing && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        Analyzing prediction...
                    </div>
                )}

                {aiCategory && !isAnalyzing && (
                    <div className="fade-in">
                        <label className="block text-sm font-medium mb-2">
                            AI detected category:
                        </label>
                        <div className={`category-${aiCategory.split('-')[0]} px-4 py-3 rounded-lg flex items-center gap-3`}
                            style={{ backgroundColor: 'var(--cat-bg)' }}>
                            <span className="text-2xl">{getCategoryInfo(aiCategory).emoji}</span>
                            <span className="font-medium" style={{ color: 'var(--cat-color)' }}>
                                {getCategoryInfo(aiCategory).label}
                            </span>
                            <button
                                type="button"
                                onClick={() => setAiCategory(null)}
                                className="ml-auto text-sm text-gray-600 hover:text-gray-800"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                )}

                {/* Manual Category Override */}
                {aiCategory === null && prediction.trim() && !isAnalyzing && (
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Select category:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['not-on-my-bingo', 'sports', 'world-events', 'financial-markets', 'politics', 'entertainment', 'technology'] as PredictionCategory[]).map(cat => {
                                const info = getCategoryInfo(cat);
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setAiCategory(cat)}
                                        className={`category-${cat.split('-')[0]} p-3 rounded-lg text-left hover:shadow-md transition-shadow`}
                                        style={{ backgroundColor: 'var(--cat-bg)' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{info.emoji}</span>
                                            <span className="text-sm font-medium" style={{ color: 'var(--cat-color)' }}>
                                                {info.label}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Target Date (Optional) */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        When should this happen? (Optional)
                    </label>
                    <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={!prediction.trim() || !aiCategory}
                        className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Make Call
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

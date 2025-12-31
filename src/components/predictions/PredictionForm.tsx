'use client';

import { useState, useEffect } from 'react';
import { PredictionCategory } from '@/types';

interface PredictionFormProps {
    onSubmit: (prediction: {
        prediction: string;
        category: PredictionCategory;
        targetDate?: string;
        meta?: any;
        isPrivate?: boolean;
    }) => void;
    onCancel: () => void;
}

export default function PredictionForm({ onSubmit, onCancel }: PredictionFormProps) {
    const [isPrivate, setIsPrivate] = useState(false);

    const [prediction, setPrediction] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [aiCategory, setAiCategory] = useState<PredictionCategory | null>(null);
    const [aiMeta, setAiMeta] = useState<any>(null);

    const [error, setError] = useState<string | null>(null);

    const analyzePrediction = async (textToAnalyze: string) => {
        if (!textToAnalyze.trim()) {
            setAiCategory(null);
            setAiMeta(null);
            setError(null);
            return;
        }

        setIsAnalyzing(true);
        setError(null); // Clear previous errors

        try {
            // Call the consolidated API route for analysis
            const response = await fetch('/api/ai/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToAnalyze }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please log in to use AI features.");
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || response.statusText);
            }

            const result = await response.json();

            // Handle the new schema from /api/ai/parse (result.meta)
            if (result.category) {
                setAiCategory(result.category);

                // New schema structure: tags/entities are in result.meta
                setAiMeta({
                    tags: result.meta?.tags || [],
                    entities: result.meta?.entities || [],
                    confidence: result.meta?.confidence
                });

                if (result.targetDate) {
                    setTargetDate(result.targetDate);
                }
            }
        } catch (error: any) {
            console.error('AI Analysis failed:', error);
            setError(error.message || "Failed to analyze prediction");
            // Don't clear category on error, maybe they want to manually override?
            // But if it's a safety error, we probably should block submission.
            // For now, error state handles the blocking.
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Debounced Auto-analysis
    // Removed Debounced Auto-analysis to save API calls
    // Trigger is now validation-based on Submit

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const textToAnalyze = prediction.trim();
        if (!textToAnalyze) return;

        // If we already have a category (manual or previous run), just submit
        if (aiCategory) {
            onSubmit({
                prediction: textToAnalyze,
                category: aiCategory,
                targetDate: targetDate || undefined,
                meta: aiMeta || undefined,
                isPrivate,
            });
            resetForm();
            return;
        }

        // Otherwise, run AI Analysis first
        setIsAnalyzing(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToAnalyze }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expired. Please log in to use AI features.");
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || response.statusText);
            }

            const result = await response.json();

            // Check for safety violation in result (though API should error)
            if (result.meta?.isSafe === false) {
                throw new Error(result.meta.violationReason || "Content flagged as unsafe");
            }

            // Construct the prediction object from AI result
            const newCategory = result.category || 'not-on-my-bingo';
            const newMeta = {
                tags: result.meta?.tags || [],
                entities: result.meta?.entities || [],
                confidence: result.meta?.confidence
            };

            // Update UI state just in case we don't unmount (though we usually do)
            setAiCategory(newCategory);
            setAiMeta(newMeta);
            if (result.targetDate) setTargetDate(result.targetDate);

            // AUTO SUBMIT with the new data
            onSubmit({
                prediction: textToAnalyze,
                category: newCategory,
                targetDate: result.targetDate || targetDate || undefined,
                meta: newMeta,
                isPrivate,
            });

            resetForm();

        } catch (error: any) {
            console.error('AI Analysis failed:', error);
            setError(error.message || "Failed to analyze prediction");
            // Do NOT submit / reset if error
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetForm = () => {
        setPrediction('');
        setTargetDate('');
        setAiCategory(null);
        setAiMeta(null);
        setIsPrivate(false);
        setError(null);
    };

    // ... existing helper functions ...

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Make a Call</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Prediction Input */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">
                            What is your call?
                        </label>
                        {isAnalyzing && (
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded animate-pulse flex items-center gap-1">
                                <span className="animate-spin">✨</span> Analyzing...
                            </span>
                        )}
                    </div>
                    <textarea
                        value={prediction}
                        onChange={(e) => setPrediction(e.target.value)}
                        placeholder="e.g., The Lakers will win the NBA championship"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        required
                        maxLength={280}
                        // Disable input while analyzing to prevent changes mid-flight
                        disabled={isAnalyzing}
                    />
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">
                            AI detects category automatically on submit (or select one below).
                        </p>
                        <span className={`text-xs font-medium ${prediction.length >= 260 ? 'text-red-500' : 'text-gray-400'}`}>
                            {prediction.length}/280
                        </span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="fade-in bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm flex items-center gap-2">
                        <span>⚠️</span>
                        {error}
                    </div>
                )}

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

                {/* Manual Category Override - Hidden by default */}
                {aiCategory === null && prediction.trim() && !isAnalyzing && (
                    <div className="fade-in">
                        {!showCategoryPicker ? (
                            <button
                                type="button"
                                onClick={() => setShowCategoryPicker(true)}
                                className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-all flex items-center justify-center gap-2"
                            >
                                <span>✏️</span> I want to pick the category & date myself
                            </button>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium">
                                        Select category:
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryPicker(false)}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        Hide
                                    </button>
                                </div>
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

                                {/* Target Date (Optional) */}
                                <div className="mt-4 border-t pt-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Target Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={targetDate}
                                        onChange={(e) => setTargetDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Privacy Toggle */}
                <div
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isPrivate
                        ? 'bg-purple-50 border-purple-200 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isPrivate ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                            {isPrivate ? '🔒' : '🌐'}
                        </div>
                        <div className="flex flex-col">
                            <span className={`text-sm font-bold ${isPrivate ? 'text-purple-900' : 'text-gray-700'}`}>
                                {isPrivate ? 'Keep Private' : 'Public Call'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {isPrivate ? 'Only visible to you' : 'Visible to everyone'}
                            </span>
                        </div>
                    </div>

                    {/* IOS Style Switch */}
                    <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center ${isPrivate ? 'bg-purple-600' : 'bg-gray-300'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isPrivate ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={!prediction.trim() || isAnalyzing || !!error} // Allow submit without category (triggers AI)
                        className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Analyzing...
                            </>
                        ) : aiCategory ? 'Make Call' : 'Analyze & Call'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isAnalyzing}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </form >
        </div >
    );
}

'use client';

import { useState, useEffect } from 'react';
import { PredictionCategory } from '@/types';
import { CATEGORY_IDS, getCategoryRaw } from '@/config/categories';

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

    const [lastAnalyzedText, setLastAnalyzedText] = useState('');

    const analyzePrediction = async (textToAnalyze: string) => {
        if (!textToAnalyze.trim()) {
            setAiCategory(null);
            setAiMeta(null);
            setError(null);
            return;
        }

        // Prevent redundant calls
        if (textToAnalyze === lastAnalyzedText && aiCategory) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToAnalyze }),
            });

            if (!response.ok) {
                if (response.status === 429 || response.status === 503) {
                    throw new Error("AI Quota may have been reached. Please try again later or select a category manually.");
                }
                if (response.status === 401) {
                    throw new Error("Session expired. Please log in to use AI features.");
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || response.statusText);
            }

            const result = await response.json();

            if (result.category) {
                setAiCategory(result.category);
                setAiMeta({
                    tags: result.meta?.tags || [],
                    entities: result.meta?.entities || [],
                    confidence: result.meta?.confidence
                });

                // Validate date is in the future (or today)
                if (result.targetDate) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const suggested = new Date(result.targetDate);
                    // allow today
                    if (suggested >= today) {
                        setTargetDate(result.targetDate);
                    }
                }
                setLastAnalyzedText(textToAnalyze);
            }
        } catch (error: any) {
            console.error('AI Analysis failed:', error);
            setError(error.message || "Failed to analyze prediction");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleBlur = () => {
        if (prediction.trim() && !isAnalyzing) {
            analyzePrediction(prediction.trim());
        }
    };

    // Debounced Auto-analysis
    // Removed Debounced Auto-analysis to save API calls
    // Trigger is now validation-based on Submit

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

            // Validate date on submit flow too
            let cleanDate = result.targetDate;
            if (cleanDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (new Date(cleanDate) < today) {
                    cleanDate = undefined; // Discard past dates
                }
            }
            if (cleanDate) setTargetDate(cleanDate);

            // AUTO SUBMIT with the new data
            onSubmit({
                prediction: textToAnalyze,
                category: newCategory,
                targetDate: cleanDate || targetDate || undefined,
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
                        onBlur={handleBlur}
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
                    <div className="fade-in bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex flex-wrap gap-2 text-xs">
                            {aiMeta.entities?.map((entity: string) => (
                                <span key={entity} className="bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                                    <span>🏛</span> {entity}
                                </span>
                            ))}
                            {aiMeta.tags?.map((tag: string) => (
                                <span key={tag} className="bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 rounded-full font-medium">
                                    #{tag}
                                </span>
                            ))}
                            {aiMeta.confidence && (
                                <span className="text-gray-400 ml-auto flex items-center font-medium text-[10px] uppercase tracking-wider">
                                    {Math.round(aiMeta.confidence * 100)}% Confidence
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
                            AI Analysis Results:
                        </label>
                        <div className={`category-${aiCategory.split('-')[0]} px-4 py-3 rounded-lg flex flex-col gap-2 shadow-sm border border-transparent`}
                            style={{
                                backgroundColor: getCategoryRaw(aiCategory).colors.bgHex,
                                borderColor: getCategoryRaw(aiCategory).colors.bg
                            }}>
                            {/* Row 1: Category Info & Edit Button */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl filter drop-shadow-sm">{getCategoryRaw(aiCategory).emoji}</span>
                                    <span className="font-bold text-base" style={{ color: getCategoryRaw(aiCategory).colors.hex }}>
                                        {getCategoryRaw(aiCategory).label}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAiCategory(null)}
                                    className="text-sm font-medium px-3 py-1.5 rounded-md bg-white/50 hover:bg-white text-gray-700 transition-colors shadow-sm"
                                >
                                    Edit
                                </button>
                            </div>

                            {/* Row 2: Target Date (My Own Line) */}
                            {targetDate && (
                                <div className="flex items-center gap-2 pl-1 border-t border-white/20 pt-2 mt-1">
                                    <span className="text-sm font-medium opacity-80" style={{ color: getCategoryRaw(aiCategory).colors.hex }}>
                                        Target Date:
                                    </span>
                                    <span className="text-sm font-bold bg-white/60 px-2 py-0.5 rounded text-gray-800 border border-white/40">
                                        {(() => {
                                            const d = new Date(targetDate + 'T00:00:00');
                                            return `${d.getDate().toString().padStart(2, '0')}-${d.toLocaleDateString('en-US', { month: 'short' })}-${d.getFullYear()}`;
                                        })()}
                                    </span>
                                </div>
                            )}
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
                                    {CATEGORY_IDS.map(cat => {
                                        const info = getCategoryRaw(cat);
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setAiCategory(cat)}
                                                className={`category-${cat.split('-')[0]} p-3 rounded-lg text-left hover:shadow-md transition-shadow`}
                                                style={{ backgroundColor: info.colors.bgHex }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{info.emoji}</span>
                                                    <span className="text-sm font-medium" style={{ color: info.colors.hex }}>
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
                                        min={new Date().toLocaleDateString('en-CA')} // YYYY-MM-DD in local time
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
                        ) : aiCategory ? 'Make the Call' : 'Analyze & Call'}
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

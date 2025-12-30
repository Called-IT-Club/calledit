'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const SUBJECTS = {
    tech: ['Apple', 'Google', 'OpenAI', 'Tesla', 'Microsoft', 'Meta', 'Amazon', 'Netflix', 'SpaceX', 'NVIDIA'],
    sports: ['LeBron', 'The Chiefs', 'Yankees', 'Real Madrid', 'Messi', 'Tiger Woods', 'Connor McGregor', 'Team USA', 'Ferrari F1'],
    entertainment: ['Taylor Swift', 'The Rock', 'Tom Cruise', 'Beyoncé', 'Disney', 'HBO', 'MrBeast', 'Drake'],
    crypto: ['Bitcoin', 'Ethereum', 'Dogecoin', 'Coinbase', 'Binance', 'Solana'],
    world: ['NASA', 'The EU', 'California', 'Texas', 'China', 'India', 'The UN']
};

const ACTIONS = [
    'will acquire', 'announces new partnership with', 'releases a foldable version of',
    'hits all-time high valuation', 'bans usage of', 'launches competitor to',
    'is revealed to be run by AI', 'wins the championship', 'files for bankruptcy',
    'announces retirement'
];

const TARGETS = [
    'TikTok', 'Twitter/X', 'ChatGPT', 'the Super Bowl', 'Mars', 'the Metaverse',
    'a new crypto coin', 'the next election', 'the moon'
];

const CATEGORIES = ['technology', 'sports', 'entertainment', 'crypto', 'world'];

function generatePrediction(category: string): any {
    const subjectList = (SUBJECTS as any)[category] || SUBJECTS.tech;
    const subject = subjectList[Math.floor(Math.random() * subjectList.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const target = TARGETS[Math.floor(Math.random() * TARGETS.length)];

    // Random date within next 2 years
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 700));

    return {
        category: category === 'crypto' ? 'financial-markets' : category === 'world' ? 'world-events' : category,
        prediction: `${subject} ${action} ${target}`,
        target_date: date.toISOString().split('T')[0],
        meta: { tags: [subject, 'Prediction'] }
    };
}

export default function SeedPage() {
    const [status, setStatus] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const runSeed = async () => {
        setLoading(true);
        setStatus(['Starting seed process...']);

        try {
            // Create 10 different users x 20 predictions = 200 items
            for (let i = 1; i <= 10; i++) {
                setStatus(prev => [...prev, `Creating User ${i}/10...`]);

                // 1. Reset Session
                await supabase.auth.signOut();

                // 2. New Guest Login
                const { error: authError } = await supabase.auth.signInAnonymously();
                if (authError) throw authError;

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Auth failed');

                // 3. Generate Data Client-Side
                const predictions = Array.from({ length: 20 }).map(() => {
                    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
                    const p = generatePrediction(cat);
                    return {
                        ...p,
                        user_id: user.id,
                        created_at: new Date().toISOString(),
                        outcome: 'pending'
                    };
                });

                // 4. Insert directly
                const { data, error } = await supabase
                    .from('predictions')
                    .insert(predictions)
                    .select();

                if (error) {
                    // Log the public error message
                    throw new Error(`DB Insert Error: ${error.message} (Code: ${error.code})`);
                }

                setStatus(prev => [...prev, `✅ User ${i}: Created ${data.length} predictions`]);

                // Small delay
                await new Promise(r => setTimeout(r, 200));
            }

            setStatus(prev => [...prev, '🎉 Seeding Complete! check /feed']);
        } catch (error: any) {
            console.error(error);
            // Publicly display the full error message
            setStatus(prev => [...prev, `❌ Error: ${error.message || JSON.stringify(error)}`]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-4">🌱 Population Control</h1>
                <p className="text-gray-600 mb-6">
                    This tool will creates 10 distinct Guest users and has each of them post 20 random realistic predictions (Total: 200).
                </p>

                <button
                    onClick={runSeed}
                    disabled={loading}
                    className="w-full btn btn-primary py-3 text-lg font-bold mb-6 disabled:opacity-50"
                >
                    {loading ? 'Seeding...' : 'Spawn 10 Users & Predictions'}
                </button>

                <div className="bg-gray-100 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs">
                    {status.length === 0 ? (
                        <span className="text-gray-400">Ready to seed...</span>
                    ) : (
                        status.map((line, i) => (
                            <div key={i} className={`mb-1 ${line.startsWith('❌') ? 'text-red-600 font-bold' : ''}`}>
                                {line}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

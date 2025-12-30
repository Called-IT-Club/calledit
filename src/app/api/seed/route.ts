import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

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

const CATEGORIES = ['technology', 'sports', 'entertainment', 'crypto', 'world'];

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Generate 20 random predictions per call
        const predictionsWithUser = Array.from({ length: 20 }).map(() => {
            const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const p = generatePrediction(cat);
            return {
                ...p,
                user_id: userId,
                created_at: new Date().toISOString(),
                status: 'active',
                outcome: 'pending'
            };
        });

        const { data, error } = await supabase
            .from('predictions')
            .insert(predictionsWithUser)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            message: `Successfully seeded ${data.length} predictions!`,
            data
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

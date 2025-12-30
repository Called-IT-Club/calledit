import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        // Prompt for the AI
        const prompt = `
            Analyze this prediction: "${text}"
            
            You are a prediction parser. Extract structured data from the text.
            
            Return JSON with:
            1. category: (one of: 'sports', 'world-events', 'financial-markets', 'politics', 'entertainment', 'technology', 'not-on-my-bingo')
            2. targetDate: (YYYY-MM-DD format, relative to today ${new Date().toISOString().split('T')[0]})
            3. meta: {
                tags: string[],      // General keywords (e.g. "NBA", "Crypto", "Election")
                entities: string[],  // Specific proper nouns (e.g. "Lakers", "Bitcoin", "Trump")
                subject: string,     // The main subject
                action: string,      // What they will do
                confidence: number   // 0-1 score
            }

            Respond ONLY with the JSON.
        `;

        // Call Ollama
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2',
                prompt: prompt,
                stream: false,
                format: 'json'
            }),
        });

        if (!response.ok) {
            throw new Error('Ollama connection failed');
        }

        const data = await response.json();

        try {
            const parsed = JSON.parse(data.response);
            return NextResponse.json(parsed);
        } catch (e) {
            console.error('Failed to parse AI response:', data.response);
            return NextResponse.json({
                category: 'not-on-my-bingo',
                meta: { tags: [], entities: [] }
            });
        }

    } catch (error) {
        console.error('AI Parse Error:', error);
        return NextResponse.json(
            { error: 'Failed to process prediction' },
            { status: 500 }
        );
    }
}

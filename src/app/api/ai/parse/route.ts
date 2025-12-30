import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const schema = {
    description: "Prediction analysis result",
    type: SchemaType.OBJECT,
    properties: {
        category: {
            type: SchemaType.STRING,
            enum: ['sports', 'world-events', 'financial-markets', 'politics', 'entertainment', 'technology', 'not-on-my-bingo']
        },
        targetDate: {
            type: SchemaType.STRING,
            description: "YYYY-MM-DD format"
        },
        meta: {
            type: SchemaType.OBJECT,
            properties: {
                tags: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                entities: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                subject: { type: SchemaType.STRING },
                action: { type: SchemaType.STRING },
                confidence: { type: SchemaType.NUMBER }
            },
            required: ["tags", "entities", "subject", "action", "confidence"]
        }
    },
    required: ["category", "targetDate", "meta"]
};

export async function POST(req: Request) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text } = await req.json();

        // Security: Scrub & Limit Input
        // 1. Trim whitespace
        // 2. Limit to 280 characters (same as frontend)
        // 3. Remove invisible control characters (basic sanitization)
        const cleanText = (text || '')
            .toString()
            .trim()
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control chars
            .slice(0, 280);

        if (!cleanText) {
            return NextResponse.json({
                category: 'not-on-my-bingo',
                meta: { tags: [], entities: [] }
            });
        }

        // Prompt for the AI

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const prompt = `
            Analyze this prediction: "${cleanText}"
            Extract structured data relative to today: ${new Date().toISOString().split('T')[0]}
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return NextResponse.json(JSON.parse(responseText));

    } catch (error) {
        console.error('AI Parse Error:', error);
        return NextResponse.json(
            { error: 'Failed to process prediction' },
            { status: 500 }
        );
    }
}

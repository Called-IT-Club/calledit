import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Schema definition for AI-powered prediction analysis.
 * Defines the expected structure of the AI response including:
 * - category: Prediction category classification
 * - targetDate: When the prediction should be evaluated
 * - meta: Additional metadata (tags, entities, subject, action, confidence)
 */
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

/**
 * POST /api/ai/parse
 * Uses Google Gemini AI to parse prediction text and extract structured data.
 * Requires authentication.
 * 
 * Security measures:
 * - Limits input to 280 characters
 * - Removes control characters
 * - Requires authenticated user
 * 
 * @param {Request} req - Request object with { text: string } in body
 * @returns {Promise<NextResponse>} Parsed prediction data with category, targetDate, and metadata
 */
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll() { /* Cookie setting handled by Next.js */ }
                }
            }
        );

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
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

        // Generate AI prompt with the sanitized text
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
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

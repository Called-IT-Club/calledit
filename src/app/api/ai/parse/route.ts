import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Schema definition for AI-powered prediction analysis.
 * Defines the expected structure of the AI response including:
 * - category: Prediction category classification
 * - targetDate: When the prediction should be evaluated
 * - meta: Additional metadata (tags, entities, subject, action, confidence)
 */
const schema: Schema = {
    description: "Prediction analysis result",
    type: SchemaType.OBJECT,
    properties: {
        category: {
            type: SchemaType.STRING,
            enum: ['sports', 'world-events', 'financial-markets', 'politics', 'entertainment', 'technology', 'health', 'not-on-my-bingo']
        } as any,
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
                confidence: { type: SchemaType.NUMBER },
                isSafe: {
                    type: SchemaType.BOOLEAN,
                    description: "True if the content is safe and appropriate. False if it contains hate speech, harassment, explicit content, or extreme crudeness."
                },
                violationReason: {
                    type: SchemaType.STRING,
                    description: "If isSafe is false, explain why (e.g., 'Hate speech', 'Explicit content'). Empty if safe."
                }
            },
            required: ["tags", "entities", "subject", "action", "confidence", "isSafe", "violationReason"]
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
        const supabase = await createSupabaseServerClient();

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            // console.log('Bypassing auth for debugging');
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
            model: process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash-lite",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const prompt = `
            Analyze this prediction: "${cleanText}"
            Extract structured data relative to today: ${new Date().toISOString().split('T')[0]}

            IMPORTANT SAFETY CHECK:
            Evaluate the text for hate speech, harassment, explicit sexual content, self-harm promotion, or extreme crudeness.
            - If it violates safety guidelines, set meta.isSafe to false and provide a reason in meta.violationReason.
            - If it is safe, set meta.isSafe to true and meta.violationReason to an empty string.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsedData = JSON.parse(responseText);

        // Enforce safety check on the server side
        if (parsedData.meta && parsedData.meta.isSafe === false) {
            console.warn(`Safety violation detected: ${parsedData.meta.violationReason}`);
            return NextResponse.json(
                { error: `Content flagged as inappropriate: ${parsedData.meta.violationReason}` },
                { status: 400 }
            );
        }

        return NextResponse.json(parsedData);

    } catch (error) {
        console.error('AI Parse Error:', error);
        return NextResponse.json(
            { error: `Failed to process prediction: ${error instanceof Error ? error.message : String(error)}` },
            { status: 500 }
        );
    }
}

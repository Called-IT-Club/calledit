import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        console.log("Analyzing prediction...");
        let user = null;
        try {
            const cookieStore = await cookies();
            const supabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() { return cookieStore.getAll(); },
                        setAll(cookiesToSet) { }
                    }
                }
            );
            const { data } = await supabase.auth.getUser();
            user = data.user;
        } catch (authErr) {
            console.error("Auth check failed:", authErr);
            // Fallthrough to 401
        }

        if (!user) {
            console.log("Unauthorized request to analyze endpoint");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log("User authenticated:", user.id);

        const { text } = await req.json();
        console.log("Analysis text:", text?.substring(0, 50) + "...");

        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            console.error("Missing GOOGLE_API_KEY");
            return NextResponse.json({ error: "Service configuration error" }, { status: 500 });
        }

        console.log("Initializing Gemini 2.5 Flash Lite...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `Analyze this prediction text and extract the most likely category, tags (arrays of strings), main entities involved, and a confidence score (0-1) of this being a valid prediction statement. Also try to guess a target date if implied.
        
        Text: "${text}"
        
        Return JSON only: { category: "sports" | "financial-markets" | "politics" | "world-events" | "entertainment" | "technology" | "not-on-my-bingo", tags: string[], entities: string[], confidence: number, targetDate: string (YYYY-MM-DD or null) }`;

        console.log("Generating content...");
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        console.log("Raw AI Response:", responseText);

        // Robust JSON extraction
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("No JSON found in response:", responseText);
            throw new Error("Invalid AI response format");
        }

        const data = JSON.parse(jsonMatch[0]);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("AI Analysis Error:", error);

        // Return more specific error message
        const errorMessage = error?.message || "Failed to analyze";
        if (errorMessage.includes("API key")) {
            return NextResponse.json({ error: "Invalid or missing API Key" }, { status: 401 });
        }

        return NextResponse.json({
            error: `Analysis failed: ${errorMessage}`,
            details: error?.toString()
        }, { status: 500 });
    }
}

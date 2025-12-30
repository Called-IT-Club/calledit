import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            console.error("Missing GOOGLE_API_KEY");
            return NextResponse.json({ error: "Service configuration error" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Analyze this prediction text and extract the most likely category, tags (arrays of strings), main entities involved, and a confidence score (0-1) of this being a valid prediction statement. Also try to guess a target date if implied.
        
        Text: "${text}"
        
        Return JSON only: { category: "sports" | "financial-markets" | "politics" | "world-events" | "entertainment" | "technology" | "not-on-my-bingo", tags: string[], entities: string[], confidence: number, targetDate: string (YYYY-MM-DD or null) }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

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

        return NextResponse.json({ error: "Failed to analyze prediction" }, { status: 500 });
    }
}

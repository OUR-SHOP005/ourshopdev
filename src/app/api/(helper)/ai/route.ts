import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const google = createGoogleGenerativeAI({
    // custom settings
});

// Custom environment variable for API key
const GEMINI_API_KEY = process.env.CUSTOM_GEMINI_API_KEY || ''

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json()

        if (!prompt) {
            return NextResponse.json(
                { success: false, error: 'Prompt is required' },
                { status: 400 }
            )
        }

        // Initialize the Vercel AI SDK with Google Gemini
        const { text } = await generateText({
            model: google('gemini-2.0-flash'),
            prompt: prompt,
        });

        return NextResponse.json({
            success: true,
            data: {
                text: text,
                model: 'gemini-2.0-flash',
                usage: {
                    promptTokens: prompt.length / 4, // Approximate token count
                    completionTokens: text.length / 4, // Approximate token count
                }
            }
        })
    } catch (error: any) {
        console.error('AI generation error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to generate AI response',
                details: error.details || undefined
            },
            { status: 500 }
        )
    }
} 
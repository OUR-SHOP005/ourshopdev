import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();

  if (!prompt) {
    return NextResponse.json(
      { error: "Missing prompt in request body" },
      { status: 400 }
    );
  }

  const googleApiKey = process.env.GOOGLE_AI_KEY;
  if (!googleApiKey) {
    return NextResponse.json(
      { error: "Google AI API key not found" },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenAI({ apiKey: googleApiKey });

  try {
    const result = await genAI.models.generateContent({
      contents: `Expert Copywriter Email Reply Generation

        Generate a direct, professional email response to the following inquiry:

        Details: ${prompt}

        IMPORTANT INSTRUCTIONS:
        - Provide ONLY the main message content without any formatting or HTML tags
        - Start with proper greeting.
        - DO NOT include any sign-offs (like "Regards", "Thanks", "Sincerely")
        - DO NOT include any signatures or contact information
        - DO NOT include any date, reference numbers, or subject lines
        - Start immediately with the relevant information or response
        - Keep the tone warm, professional, and conversational
        - Address the specific question or concern directly and thoroughly
        - Be concise but comprehensive (aim for 3-5 paragraphs maximum)
        - Use natural language that sounds human, not robotic
        - Avoid generic responses; be specific to the inquiry
        - Include specific details from the prompt when appropriate
        
        CONTEXT:
        This content will be inserted into an email template that already contains:
        - A greeting: "Hi {username},"
        - An introduction: "Thank you for reaching out to us. We truly value your message and appreciate your efforts."
        - A signature: "Warm regards, OurShop"
        
        Your response will be placed between the introduction and signature, so it should flow naturally from the introduction.
        
        EXAMPLES:
        
        INCORRECT FORMAT:
        "Dear Customer, Thank you for your inquiry about our services. We offer premium web development at competitive rates with a focus on responsive design and SEO optimization. Please let me know if you need more information. Best regards, Support Team"
        
        CORRECT FORMAT:
        "We offer premium web development services at competitive rates starting from $1,500 for basic websites. Our packages include responsive design, SEO optimization, and 3 months of free maintenance. Our team specializes in React, Next.js, and WordPress solutions that are tailored to your specific business needs."`,
      model: "gemini-2.0-flash",
    });

    const response =
      result.text?.replace(/^```json\n/, "").replace(/\n```$/, "") || "[]";

    return NextResponse.json({ reply: response });
  } catch (error) {
    console.error("Error generating email reply:", error);
    return NextResponse.json(
      { error: "Failed to generate email reply" },
      { status: 500 }
    );
  }
}

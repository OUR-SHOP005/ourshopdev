import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PortfolioRequestSchema } from "@/lib/types";

async function generatePortfolioContent(idea: string, genAI: GoogleGenAI) {
  const prompt = `Generate a detailed Portfolio idea (in JSON format) about "${idea}". Include:
  title: string,
  content: string (1000-1500 characters, with some markdown formatting),
  description: string (200-250 characters),
  excerpt: string (less than 160 characters),
  technologies: string[] (at least 3 to 5 relevant technologies),
  category: string,
  status: "planned",
  markdown: true
  `;

  try {
    const result = await genAI.models.generateContent({
      contents: prompt,
      model: "gemini-2.0-flash",
    });

    const response =
      result.text?.replace(/^```json\n/, "").replace(/\n```$/, "") || "[]";
    // console.log(`Portfolio content response:`, response);
    return response;
  } catch (error) {
    console.error("Error generating Portfolio content:", error);
    throw new Error("Failed to parse Portfolio JSON");
  }
}

export async function GET(request: NextRequest) {
  const idea = request.nextUrl.searchParams.get("idea");

  if (!idea) {
    return NextResponse.json(
      { error: "Missing idea parameter" },
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
    const partialPortfolio = await generatePortfolioContent(idea, genAI);
    // console.log(`partial Portfolio:`, partialPortfolio);
    if (!partialPortfolio) {
      return NextResponse.json(
        { error: "Failed to generate Portfolio" },
        { status: 500 }
      );
    }
    const PortfolioData = JSON.parse(partialPortfolio);
    const slug = PortfolioData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const fullPortfolio = {
      title: PortfolioData.title,
      slug: PortfolioData.slug || slug,
      content: PortfolioData.content,
      description: PortfolioData.description,
      excerpt:
        PortfolioData.excerpt || PortfolioData.description.substring(0, 157),
      featuredImage: "",
      gallery: [],
      technologies: PortfolioData.technologies || [],
      category: PortfolioData.category || "Web Development",
      status: "planned",
      markdown: true,
      featured: false,
      aiGenerated: true,
    };

    PortfolioRequestSchema.parse(fullPortfolio);
    console.log("full Portfolio:", fullPortfolio);
    return NextResponse.json(fullPortfolio);
  } catch (error: unknown) {
    console.error("Error generating Portfolio:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}

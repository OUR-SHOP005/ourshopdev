import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { BlogRequestSchema as BlogPostSchema } from "@/lib/types";

interface Result {
  title: string;
  content: string;
  url: string;
  score: number;
}

async function conductResearch(topic: string) {
  const researchNotes: string[] = [];

  const apiKey = process.env.TAVILY_API_KEY;
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: `{"query":"${topic}","topic":"general","search_depth":"advanced","chunks_per_source":3,"max_results":5,"time_range":"month","include_answer":true,"include_raw_content":false,"include_images":true,"include_image_descriptions":true}`,
  };
  fetch("https://api.tavily.com/search", options)
    .then((response) => response.json())
    .then((response) => {
      const searchResults = response;
      researchNotes.push(
        `query: ${searchResults.query}\nanswer: ${searchResults.answer}`
      );
      // console.log(`search results:`, searchResults);
      const researchNote = searchResults.results
        .map(
          (result: Result) =>
            `title: ${result.title}\nContent: ${result.content}\n Source: ${result.url} relevancy score: ${result.score}`
        )
        .join("\n\n");
      researchNotes.push(researchNote);
      const imageDetail = searchResults.images
        .map(
          (image: { url: string; description: string }) =>
            `image url: ${image.url}\n\nimage description: ${image.description}`
        )
        .join("\n\n");
      researchNotes.push(imageDetail);
    })
    .catch((error: unknown) => {
      console.error(`Error fetching research for: ${topic}`, error);
    });

  return researchNotes;
}

async function generateBlogContent(
  topic: string,
  researchNotes: string[],
  genAI: GoogleGenAI
) {
  const prompt = `Expert Copywriter Blog Post Generation\n\nTopic: ${topic}\n\n use the Research Notes wisely.Research Notes:\n${researchNotes.join(
    "\n\n"
  )}\n\nPlease generate a comprehensive and SEO-optimized blog post that includes the following elements:\n- A compelling and engaging title that captures the essence of the topic\n- Detailed and insightful content that provides value to the reader\n- A concise excerpt that summarizes the main points of the blog post\n\nThe output should be formatted as JSON, containing the fields: title, content, and excerpt. Ensure that markdown is used exclusively within the content to enhance readability and engagement, and not in any other fields. Please adhere to the following schema: 
  title: z.string(),
  slug: z.string(),
  content: z.string().max(1000),
  excerpt: z.string().max(100),
  featuredImage: z.string(),
  featured: false,
  isPublished: false,
  metaTitle: z.string().max(20),
  metaDescription: z.string().min(10).max(100),
  keywords: z.array(z.string()).min(4).max(7)
    `;

  try {
    const result = await genAI.models.generateContent({
      contents: prompt,
      model: "gemini-2.0-flash",
    });

    const response =
      result.text?.replace(/^```json\n/, "").replace(/\n```$/, "") || "[]";
    // console.log(`blog content response:`, response);
    return response;
  } catch (error) {
    console.error("Error generating blog content:", error);
    throw new Error("Failed to parse blog post JSON");
  }
}

export async function GET(request: NextRequest) {
  const topic = request.nextUrl.searchParams.get("topic");

  if (!topic) {
    return NextResponse.json(
      { error: "Missing topic parameter" },
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
    const researchNotes = await conductResearch(topic);
    const partialBlogPost = await generateBlogContent(
      topic,
      researchNotes,
      genAI
    );
    // console.log(`partial blog post:`, partialBlogPost);
    if (!partialBlogPost) {
      return NextResponse.json(
        { error: "Failed to generate blog post" },
        { status: 500 }
      );
    }
    const blogPost = JSON.parse(partialBlogPost);
    const slug = blogPost.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const fullBlogPost = {
      title: blogPost.title,
      slug: slug,
      content: blogPost.content,
      excerpt: blogPost.excerpt,
      featuredImage: "",
      featured: blogPost.featured || false,
      isPublished: blogPost.isPublished || false,
      seo: {
        metaTitle: blogPost.metaTitle || blogPost.title,
        metaDescription:
          blogPost.metaDescription || blogPost.excerpt?.substring(0, 157) || "",
        canonicalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${slug}`,
        keywords: blogPost.keywords || topic.split(" "),
      },
    };

    BlogPostSchema.parse(fullBlogPost);
    console.log(fullBlogPost);
    return NextResponse.json(fullBlogPost);
  } catch (error: unknown) {
    console.error("Error generating blog post:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}

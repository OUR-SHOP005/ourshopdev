import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import FormData from "form-data";

// Initialize Google GenAI
const GOOGLE_AI_KEY = process.env.GOOGLE_AI_KEY;
if (!GOOGLE_AI_KEY) {
  throw new Error("GOOGLE_AI_KEY is not set");
}
const ai = new GoogleGenAI({ apiKey: GOOGLE_AI_KEY });

async function PromptGenerator(data: any) {
  try {
    const enhancementPrompt = `you are an image aretist . with years of expertience write the short discription about ${
      data.prompt || data || "beautiful landscape"
    } in 10 words. writ the description in quatation marks (" description ")`;

    const result = await ai.models.generateContent({
      contents: enhancementPrompt,
      model: "gemini-2.0-flash",
    });
    let generatedPrompt = result.text;
    if (result.text?.includes(`"`)) {
      generatedPrompt = generatedPrompt?.split(`"`)[1];
      if (generatedPrompt?.includes(`"`)) {
        generatedPrompt = generatedPrompt?.split(`"`)[0];
      }
    }

    // Create a concise, image-focused prompt
    const enhancedPrompt = `Generate an image of ${generatedPrompt?.trim()}, photorealistic, 16:9 aspect ratio`;

    // Skip text generation and go straight to image generation
    console.log("Using prompt for image generation:", enhancedPrompt);
    return enhancedPrompt;
  } catch (error) {
    console.error("Error generating enhanced prompt:", error);
    // Fallback to original prompt with quality enhancements
    return `${
      data.prompt || "beautiful landscape"
    }, 8K resolution, hyper-detailed, photorealistic, cinematic lighting`;
  }
}
// Function to generate image from prompt
async function generateImage(prompt: string) {
  try {
    // Set responseModalities to include "Image" so the model can generate an image
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });
    console.log("response", response?.candidates?.[0]);
    console.log("response content", response?.candidates?.[0]?.content);
    console.log("response parts", response?.candidates?.[0]?.content?.parts);
    // Find the image part in the response
    for (const part of response?.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        console.log("imageData", imageData);
        if (!imageData) {
          throw new Error("No image data found");
        }
        const buffer = Buffer.from(imageData, "base64");

        // Create a unique filename
        const filename = `gemini-${uuidv4()}.png`;
        const tempDir = path.join(process.cwd(), "temp");

        // Ensure temp directory exists
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        const filePath = path.join(tempDir, filename);
        fs.writeFileSync(filePath, buffer);

        return { filePath, filename };
      }
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Function to upload the generated image
async function uploadImage(filePath: string) {
  try {
    const formData = new FormData();
    formData.append("images", fs.createReadStream(filePath));

    const response = await fetch(
      process.env.NEXT_PUBLIC_BASE_URL + "/api/upload",
      {
        method: "POST",
        // @ts-expect-error FormData type mismatch with fetch
        body: formData,
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.files[0]?.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// POST endpoint to generate and upload image
export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    if (!data) {
      return NextResponse.json({ error: "data is required" }, { status: 400 });
    }
    const prompt = await PromptGenerator(data);
    // Generate image
    const { filePath } = await generateImage(prompt);

    // Upload image
    const imageUrl = await uploadImage(filePath);

    // Delete temp file
    fs.unlinkSync(filePath);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to generate or upload image" },
      { status: 500 }
    );
  }
}

// GET endpoint to generate and upload image using search params
// Example URL: http://localhost:3000/api/ai/imageGen?data=create+an+image+of+cat+on+dog
export async function GET(request: NextRequest) {
  try {
    const data = request.nextUrl.searchParams.get("data");

    if (!data) {
      return NextResponse.json({ error: "data is required" }, { status: 400 });
    }

    const prompt = await PromptGenerator(data);
    // Generate image
    const { filePath } = await generateImage(prompt);

    // Upload image
    const imageUrl = await uploadImage(filePath);

    // Delete temp file
    fs.unlinkSync(filePath);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to generate or upload image" },
      { status: 500 }
    );
  }
}

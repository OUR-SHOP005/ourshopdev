import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MarketingMail, Portfolio, Blog } from "@/lib/models";
import { Resend } from "resend";
import { GoogleGenAI } from "@google/genai";
import { checkRoleSupabase } from "@/utils/roles";
import marketingEmailTemplate from "@/components/Mail/marketingEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = `OurShop <${
  process.env.FROM_UPDATE_EMAIL || "updates@utkarshchaudhary.space"
}>`;

export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const isAdmin = await checkRoleSupabase("admin");
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { recipientIds, contentType, contentId, customSubject } =
      await request.json();

    if (!recipientIds || !recipientIds.length || !contentType || !contentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get content details based on type
    let contentTitle;
    let contentDescription;
    let contentUrl;

    if (contentType === "blog") {
      const blog = await Blog.findById(contentId);
      if (!blog) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }
      contentTitle = blog.title;
      contentDescription = blog.excerpt || "";
      contentUrl = `/blog/${blog.slug}`;
    } else if (contentType === "Portfolio") {
      const portfolio = await Portfolio.findById(contentId);
      if (!portfolio) {
        return NextResponse.json(
          { error: "Portfolio not found" },
          { status: 404 }
        );
      }
      contentTitle = portfolio.title;
      contentDescription = portfolio.description || "";
      contentUrl = `/portfolio/${portfolio.slug}`;
    } else {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    // Get recipients
    const recipients = await MarketingMail.find({
      _id: { $in: recipientIds },
      hasConsented: true,
    }).lean();

    if (!recipients.length) {
      return NextResponse.json(
        { error: "No valid recipients found" },
        { status: 400 }
      );
    }

    // Generate email content with Google AI for a generic recipient
    // We'll personalize it slightly for each recipient
    const googleApiKey = process.env.GOOGLE_AI_KEY;
    if (!googleApiKey) {
      return NextResponse.json(
        { error: "Google AI API key not found" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenAI({ apiKey: googleApiKey });
    const subject = customSubject || `New ${contentType}: ${contentTitle}`;

    const aiResponse = await genAI.models.generateContent({
      contents: `Generate an engaging marketing email about the following ${contentType}:
      
      Title: ${contentTitle}
      Description: ${contentDescription}
      
      INSTRUCTIONS:
      - Return a JSON object with these properties: greeting, mainContent, cta, closing
      - greeting: A warm greeting .
      - use \${name} as a placeholder for the recipient's name. like "Hi \${name}, hope you're having a great day!".
      - mainContent: 2-3 paragraphs highlighting the key points and benefits (150-200 words)
      - cta: A compelling call-to-action sentence
      - closing: A friendly sign-off message (max 1 sentence)
      
      The tone should be professional yet conversational, enthusiastic without being salesy, and focused on the value to the reader.`,
      model: "gemini-2.0-flash",
    });

    let emailContent;
    try {
      // Extract JSON from AI response and parse it
      const jsonString = aiResponse.text?.match(/\{[\s\S]*\}/)?.[0] || "{}";
      emailContent = JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      emailContent = {
        greeting: `Hello there!`,
        mainContent: `We're excited to share our latest ${contentType} with you: ${contentTitle}. ${contentDescription}`,
        cta: `Check it out now!`,
        closing: `Thanks for your continued support.`,
      };
    }

    // Send emails
    const emailPromises = recipients.map(async (recipient) => {
      // Replace ${name} placeholder with actual recipient name or fallback to "there"
      const personalizedGreeting = emailContent.greeting.replace(
        "${name}",
        recipient.name || "there"
      );

      const html = marketingEmailTemplate({
        greeting: personalizedGreeting,
        mainContent: emailContent.mainContent.replace(
          "${name}",
          recipient.name || "there"
        ),
        cta: emailContent.cta,
        ctaUrl: `${process.env.NEXT_PUBLIC_BASE_URL}${contentUrl}`,
        ctaText: `View the ${contentType}`,
        closing: emailContent.closing,
        subscriberId: recipient?._id?.toString() || "",
      });

      return resend.emails.send({
        from: FROM_EMAIL,
        to: recipient.email,
        subject: subject,
        html: html,
      });
    });

    await Promise.all(emailPromises);

    return NextResponse.json({
      message: `Successfully sent ${recipients.length} emails`,
      success: true,
    });
  } catch (error: unknown) {
    console.error("Error sending marketing emails:", error);
    return NextResponse.json(
      {
        error: "Failed to send marketing emails",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

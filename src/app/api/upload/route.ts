import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";
import sharp from "sharp";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

interface CustomFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

// Compress image using Sharp before uploading to Cloudinary
async function compressImage(
  buffer: Buffer,
  mimetype: string
): Promise<Buffer> {
  // Start with a Sharp instance
  let sharpInstance = sharp(buffer);

  // Apply different optimization strategies based on image type
  if (mimetype === "image/jpeg" || mimetype === "image/jpg") {
    sharpInstance = sharpInstance.jpeg({
      quality: 80, // High quality but still reduced
      mozjpeg: true, // Use mozjpeg compression
    });
  } else if (mimetype === "image/png") {
    sharpInstance = sharpInstance.png({
      compressionLevel: 8, // Higher compression level
      adaptiveFiltering: true,
      palette: true, // Convert to indexed color palette when possible
    });
  } else if (mimetype === "image/webp") {
    sharpInstance = sharpInstance.webp({
      quality: 80,
      effort: 6, // Balance between compression speed and ratio
    });
  } else if (mimetype === "image/gif") {
    // GIFs are more challenging to compress without quality loss
    // Simply pass through with minimal processing
    return buffer;
  }

  // Return compressed buffer
  return await sharpInstance.toBuffer();
}

const uploadToCloudinary = async (file: CustomFile) => {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      resource_type: "auto" as const,
      folder: "uploads",
      transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(new Error("Failed to upload to Cloudinary"));
        } else {
          resolve({
            name: file.originalname,
            url: result?.secure_url,
            public_id: result?.public_id,
            size: result?.bytes,
            format: result?.format,
          });
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Missing Cloudinary configuration");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get formData directly
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    // Validate files existence
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Validate file count
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        {
          error: "File upload error",
          code: "LIMIT_FILE_COUNT",
          message: `Too many files. Maximum is ${MAX_FILES} files`,
        },
        { status: 400 }
      );
    }

    // Validate file types and size
    for (const file of files) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: "Invalid file type",
            message: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(
              ", "
            )}`,
            allowedTypes: ALLOWED_FILE_TYPES,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: "File too large",
            message: `File too large. Maximum size is ${
              MAX_FILE_SIZE / (1024 * 1024)
            }MB`,
          },
          { status: 400 }
        );
      }
    }

    // Convert Files to CustomFile format and compress
    const customFiles = await Promise.all(
      files.map(async (file) => {
        const buffer = await file.arrayBuffer();
        const originalBuffer = Buffer.from(buffer);

        // Compress the image
        const compressedBuffer = await compressImage(originalBuffer, file.type);

        // Calculate compression ratio for logging/monitoring
        const compressionRatio =
          (1 - compressedBuffer.length / originalBuffer.length) * 100;
        console.log(
          `Compressed ${file.name} by ${compressionRatio.toFixed(2)}% (${
            originalBuffer.length
          } → ${compressedBuffer.length} bytes)`
        );

        return {
          buffer: compressedBuffer,
          originalname: file.name,
          mimetype: file.type,
          size: compressedBuffer.length,
        } as CustomFile;
      })
    );

    // Upload files to Cloudinary
    const uploadPromises = customFiles.map(uploadToCloudinary);
    const uploadedResults = await Promise.all(uploadPromises);

    return NextResponse.json(
      {
        message: "Files uploaded successfully",
        files: uploadedResults,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);

    // Handle other errors
    return NextResponse.json(
      {
        error: "Upload failed",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

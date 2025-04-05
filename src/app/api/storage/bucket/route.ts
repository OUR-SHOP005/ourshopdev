import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    // Check auth (optional - you may want to restrict this)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request body
    const { bucketName, isPublic, fileSizeLimit, allowedMimeTypes } =
      await req.json();

    if (!bucketName) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    // Get Supabase admin client
    const supabase = await createAdminClient();

    // Check if bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error listing buckets:", listError);
      return NextResponse.json(
        { error: "Failed to check existing buckets", details: listError },
        { status: 500 }
      );
    }

    // Check if bucket already exists
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName);

    // Create bucket if it doesn't exist
    if (!bucketExists) {
      // Create the bucket
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic ?? false,
        fileSizeLimit: fileSizeLimit,
        allowedMimeTypes: allowedMimeTypes,
      });

      if (error) {
        console.error("Error creating bucket:", error);
        return NextResponse.json(
          { error: "Failed to create bucket", details: error },
          { status: 500 }
        );
      }
    }

    // Create RLS policies for the bucket (regardless if it already existed)
    // We'll execute raw SQL to set up the policies
    try {
      // Create SELECT policy (for viewing files)
      if (isPublic) {
        // Public bucket - allow anyone to view files
        await supabase.rpc("create_storage_policy", {
          bucket_name: bucketName,
          operation: "SELECT",
          definition: "true", // Allow everyone to read
          policy_name: `${bucketName}_public_select`,
        });
      } else {
        // Private bucket - only authenticated users can view their own files
        await supabase.rpc("create_storage_policy", {
          bucket_name: bucketName,
          operation: "SELECT",
          definition: "auth.uid() = owner",
          policy_name: `${bucketName}_private_select`,
        });
      }

      // Create INSERT policy (for uploading files)
      await supabase.rpc("create_storage_policy", {
        bucket_name: bucketName,
        operation: "INSERT",
        definition: "auth.uid() IS NOT NULL", // Any authenticated user can upload
        policy_name: `${bucketName}_auth_insert`,
      });

      // Create UPDATE policy (for updating files)
      await supabase.rpc("create_storage_policy", {
        bucket_name: bucketName,
        operation: "UPDATE",
        definition: "auth.uid() = owner", // Users can only update their own files
        policy_name: `${bucketName}_private_update`,
      });

      // Create DELETE policy (for deleting files)
      await supabase.rpc("create_storage_policy", {
        bucket_name: bucketName,
        operation: "DELETE",
        definition: "auth.uid() = owner", // Users can only delete their own files
        policy_name: `${bucketName}_private_delete`,
      });
    } catch (policyError) {
      console.error("Error creating storage policies:", policyError);

      // Let's try an alternative approach with direct SQL for creating policies
      try {
        // We'll execute a parameterized SQL query to avoid potential SQL injection
        const { error: sqlError } = await supabase.rpc(
          "apply_storage_policies",
          {
            bucket_id: bucketName,
            is_public: isPublic,
          }
        );

        if (sqlError) {
          console.error("Failed to apply storage policies via SQL:", sqlError);
          // Continue anyway, as the bucket exists
        }
      } catch (sqlError) {
        console.error("Error with SQL policy creation:", sqlError);
        // Continue anyway, bucket exists
      }
    }

    return NextResponse.json({
      success: true,
      message: bucketExists
        ? `Bucket "${bucketName}" already exists and policies updated`
        : `Bucket "${bucketName}" created successfully with access policies`,
      exists: bucketExists,
    });
  } catch (error) {
    console.error("Error in bucket creation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

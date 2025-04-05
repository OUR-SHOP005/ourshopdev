"use client";

import { useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useDropzone } from "react-dropzone";
import {
  CheckCircle,
  File,
  Upload,
  X,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Helper function to format file sizes
const formatBytes = (
  bytes: number,
  decimals = 2,
  size?: "bytes" | "KB" | "MB" | "GB" | "TB"
) => {
  if (bytes === 0) return "0 bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["bytes", "KB", "MB", "GB", "TB"];
  const i = size
    ? sizes.indexOf(size)
    : Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Define file type
interface FileWithPreview extends File {
  preview?: string | null;
  errors: Array<{ message: string }>;
}

// Define component props
interface FileUploadProps {
  bucketName?: string;
  path?: string;
  allowedMimeTypes?: string[];
  maxFiles?: number;
  maxFileSize?: number;
  setFileUrls?: (urls: string[]) => void;
  className?: string;
}

export default function FileUpload({
  bucketName = "files",
  path = "",
  allowedMimeTypes = [],
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  setFileUrls,
  className,
}: FileUploadProps) {
  // State management
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([]);
  const [successes, setSuccesses] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bucketError, setBucketError] = useState<string | null>(null);
  const [bucketLoading, setBucketLoading] = useState(true);

  // Initialize Supabase client
  const supabase = createClient();

  // Initialize bucket
  useEffect(() => {
    const initBucket = async () => {
      try {
        setBucketLoading(true);
        // Create the bucket using API endpoint
        const response = await fetch("/api/storage/bucket", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bucketName,
            isPublic: setFileUrls ? true : false,
            fileSizeLimit: maxFileSize,
            allowedMimeTypes: allowedMimeTypes.length
              ? allowedMimeTypes
              : undefined,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Error creating bucket:", error);
          setBucketError(error.error || "Failed to create storage bucket");
        }

        setBucketLoading(false);
      } catch (error) {
        console.error("Error initializing bucket:", error);
        setBucketError("Failed to initialize storage");
        setBucketLoading(false);
      }
    };

    initBucket();
  }, [bucketName, maxFileSize, allowedMimeTypes, setFileUrls]);

  // Reset success state when files change
  useEffect(() => {
    if (files.length === 0) {
      setIsSuccess(false);
    }
  }, [files]);

  // Handle file upload
  const onUpload = useCallback(async () => {
    if (files.length === 0) return;

    setLoading(true);
    setErrors([]);
    setSuccesses([]);
    const uploadPromises = files.map(async (file) => {
      try {
        // Generate unique file path to prevent overwrites
        const uniqueFilePath = `${path ? `${path}/` : ""}${Date.now()}-${
          file.name
        }`;

        // Upload to Supabase
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(uniqueFilePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          setErrors((prev) => [
            ...prev,
            { name: file.name, message: error.message },
          ]);
          return null;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(uniqueFilePath);

        setSuccesses((prev) => [...prev, file.name]);
        return publicUrl;
      } catch (error) {
        console.error("Upload error:", error);
        setErrors((prev) => [
          ...prev,
          {
            name: file.name,
            message: error instanceof Error ? error.message : "Unknown error",
          },
        ]);
        return null;
      }
    });

    // Wait for all uploads to complete
    const urls = (await Promise.all(uploadPromises)).filter(
      Boolean
    ) as string[];

    // Update state
    setLoading(false);
    setIsSuccess(errors.length === 0 && urls.length > 0);

    // Call the callback with the file URLs
    if (setFileUrls && urls.length > 0) {
      setFileUrls(urls);
    }
  }, [files, bucketName, path, supabase, setFileUrls]);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject, inputRef } =
    useDropzone({
      accept: allowedMimeTypes.length
        ? allowedMimeTypes.reduce((acc, type) => {
            acc[type] = [];
            return acc;
          }, {} as Record<string, string[]>)
        : undefined,
      maxFiles,
      maxSize: maxFileSize,
      onDrop: (acceptedFiles, rejectedFiles) => {
        // Create preview URLs for images
        const newFiles = acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : null,
            errors: [],
          })
        );

        // Handle rejected files
        const rejectedWithErrors = rejectedFiles.map((rejected) => ({
          ...rejected.file,
          errors: rejected.errors,
          preview: null,
        }));

        setFiles([...newFiles, ...rejectedWithErrors] as FileWithPreview[]);
      },
    });

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  // Handle file removal
  const handleRemoveFile = useCallback(
    (fileName: string) => {
      setFiles(files.filter((file) => file.name !== fileName));
    },
    [files]
  );

  // Determine UI states
  const isInvalid =
    (isDragActive && isDragReject) ||
    (errors.length > 0 && !isSuccess) ||
    files.some((file) => file.errors.length !== 0);

  const exceedMaxFiles = files.length > maxFiles;

  // Show loading state while bucket is being initialized
  if (bucketLoading) {
    return (
      <div className={cn("w-full", className)}>
        <div className='border-2 border-dashed rounded-lg p-4 md:p-6 text-center bg-card/50 border-muted'>
          <Loader2 className='animate-spin h-8 w-8 mx-auto text-muted-foreground mb-2' />
          <p className='text-muted-foreground'>Initializing storage...</p>
        </div>
      </div>
    );
  }

  // Show error if bucket creation failed
  if (bucketError) {
    return (
      <div className={cn("w-full", className)}>
        <div className='border-2 border-destructive rounded-lg p-4 text-center'>
          <AlertCircle className='mx-auto h-8 w-8 text-destructive mb-2' />
          <p className='text-destructive font-medium'>Storage Error</p>
          <p className='text-sm text-muted-foreground mt-1'>{bucketError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Dropzone container */}
      <div
        {...getRootProps({
          className: cn(
            "border-2 border-dashed rounded-lg p-4 md:p-6 text-center transition-colors duration-300",
            "bg-card/50 hover:bg-card/80 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50",
            isSuccess ? "border-solid border-primary/70" : "border-muted",
            isDragActive && !isDragReject && "border-primary bg-primary/5",
            isInvalid && "border-destructive bg-destructive/5"
          ),
        })}
      >
        <input {...getInputProps()} />

        {/* Success state */}
        {isSuccess ? (
          <div className='flex flex-row items-center gap-x-2 justify-center py-2'>
            <CheckCircle
              size={20}
              className='text-primary'
            />
            <p className='text-primary font-medium'>
              Successfully uploaded {successes.length} file
              {successes.length > 1 ? "s" : ""}
            </p>
          </div>
        ) : (
          <>
            {/* Empty state (when no files are selected) */}
            {files.length === 0 && (
              <div className='flex flex-col items-center gap-y-3 py-4'>
                <div className='p-3 rounded-full bg-muted'>
                  <Upload
                    size={24}
                    className='text-muted-foreground'
                  />
                </div>
                <div className='space-y-1 text-center'>
                  <p className='text-sm font-medium'>
                    Upload{maxFiles > 1 ? ` up to ${maxFiles}` : ""} file
                    {maxFiles > 1 ? "s" : ""}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Drag and drop or{" "}
                    <button
                      type='button'
                      onClick={() => inputRef.current?.click()}
                      className='text-primary underline hover:text-primary/80 transition-colors'
                    >
                      browse
                    </button>
                  </p>
                  {maxFileSize && (
                    <p className='text-xs text-muted-foreground'>
                      Max size: {formatBytes(maxFileSize)}
                    </p>
                  )}
                  {allowedMimeTypes.length > 0 && (
                    <p className='text-xs text-muted-foreground'>
                      Allowed types: {allowedMimeTypes.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* File list */}
            {files.length > 0 && (
              <div className='space-y-2 my-2'>
                <div className='max-h-60 overflow-y-auto rounded-md bg-background/50 p-1'>
                  {files.map((file, idx) => {
                    const fileError = errors.find((e) => e.name === file.name);
                    const isSuccessfullyUploaded = successes.includes(
                      file.name
                    );

                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        className='flex items-center gap-x-3 border-b border-border/50 p-2 last:border-0 group hover:bg-muted/30 rounded-sm transition-colors'
                      >
                        {/* Preview thumbnail */}
                        {file.type?.startsWith("image/") && file.preview ? (
                          <div className='h-12 w-12 relative rounded-md overflow-hidden bg-background flex-shrink-0 border'>
                            <Image
                              src={file.preview}
                              alt={file.name}
                              fill
                              className='object-cover'
                              sizes='48px'
                            />
                          </div>
                        ) : (
                          <div className='h-12 w-12 rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0 border'>
                            {file.type?.startsWith("image/") ? (
                              <ImageIcon
                                size={20}
                                className='text-muted-foreground'
                              />
                            ) : (
                              <File
                                size={20}
                                className='text-muted-foreground'
                              />
                            )}
                          </div>
                        )}

                        {/* File info */}
                        <div className='flex-1 min-w-0'>
                          <p
                            className='text-sm font-medium truncate'
                            title={file.name}
                          >
                            {file.name}
                          </p>

                          {/* Status messages */}
                          {file.errors.length > 0 ? (
                            <p className='text-xs text-destructive flex items-center gap-x-1'>
                              <AlertCircle size={12} />
                              {file.errors
                                .map((e: { message: string }) =>
                                  e.message.startsWith("File is larger than")
                                    ? `File is larger than ${formatBytes(
                                        maxFileSize
                                      )} (Size: ${formatBytes(file.size)})`
                                    : e.message
                                )
                                .join(", ")}
                            </p>
                          ) : loading && !isSuccessfullyUploaded ? (
                            <p className='text-xs text-muted-foreground flex items-center gap-x-1'>
                              <Loader2
                                size={12}
                                className='animate-spin'
                              />
                              Uploading...
                            </p>
                          ) : fileError ? (
                            <p className='text-xs text-destructive flex items-center gap-x-1'>
                              <AlertCircle size={12} />
                              Failed: {fileError.message}
                            </p>
                          ) : isSuccessfullyUploaded ? (
                            <p className='text-xs text-primary flex items-center gap-x-1'>
                              <CheckCircle size={12} />
                              Uploaded successfully
                            </p>
                          ) : (
                            <p className='text-xs text-muted-foreground'>
                              {formatBytes(file.size)}
                            </p>
                          )}
                        </div>

                        {/* Remove button */}
                        {!loading && !isSuccessfullyUploaded && (
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            className='h-8 w-8 opacity-70 group-hover:opacity-100 transition-opacity'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(file.name);
                            }}
                          >
                            <X size={16} />
                            <span className='sr-only'>Remove {file.name}</span>
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Error message for exceeding max files */}
                {exceedMaxFiles && (
                  <p className='text-sm text-destructive flex items-center gap-x-1 mt-1'>
                    <AlertCircle size={14} />
                    You can upload up to {maxFiles} files. Please remove{" "}
                    {files.length - maxFiles} file(s).
                  </p>
                )}

                {/* Upload button */}
                {files.length > 0 && !exceedMaxFiles && (
                  <Button
                    type='button'
                    variant='default'
                    size='sm'
                    className='mt-2 w-full sm:w-auto'
                    onClick={onUpload}
                    disabled={
                      files.some((file) => file.errors.length !== 0) || loading
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={16}
                          className='mr-2 animate-spin'
                        />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload
                          size={16}
                          className='mr-2'
                        />
                        Upload {files.length} file{files.length > 1 ? "s" : ""}
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

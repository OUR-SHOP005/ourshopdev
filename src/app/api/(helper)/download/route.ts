import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const { url } = await request.json()

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 })
        }

        // Validate URL format
        try {
            new URL(url)
        } catch (error) {
            return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
        }

        // Fetch the file from the provided URL
        const response = await fetch(url)

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to download: ${response.status} ${response.statusText}` },
                { status: response.status }
            )
        }

        // Get the content type and file name from the response
        const contentType = response.headers.get("content-type") || "application/octet-stream"
        const contentDisposition = response.headers.get("content-disposition")

        let filename = "downloaded-file"
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1]
            }
        } else {
            // Try to extract filename from URL if no content-disposition header
            const urlParts = new URL(url).pathname.split("/")
            const urlFilename = urlParts[urlParts.length - 1]
            if (urlFilename && urlFilename.includes(".")) {
                filename = urlFilename
            }
        }

        // Get the file content as ArrayBuffer
        const fileBuffer = await response.arrayBuffer()

        // Return the file as a response
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error("Download error:", error)
        return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
    }
} 
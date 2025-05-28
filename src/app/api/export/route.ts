import { NextResponse } from "next/server"

// Helper function to convert data to CSV
function convertToCSV(data: any[], fields: string[]) {
  const header = fields.join(",") + "\n"
  const rows = data.map((item) => {
    return fields
      .map((field) => {
        const value = field.split(".").reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ""), item)
        // Handle nested objects, dates, and escape commas
        if (value instanceof Date) {
          return `"${value.toISOString()}"`
        } else if (typeof value === "object" && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`
        } else if (typeof value === "string" && value.includes(",")) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(",")
  })
  return header + rows.join("\n")
}

export async function POST(request: Request) {
  try {
    const { data, type, fields } = await request.json()

    if (!data || !Array.isArray(data) || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    const csv = convertToCSV(data, fields)

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

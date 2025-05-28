import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
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

// Helper function to convert data to PDF
function convertToPDF(data: any[], fields: string[], type: string) {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(16)
  doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 14, 22)
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

  // Format header labels (capitalize and replace dots with spaces)
  const headers = fields.map(field => {
    const label = field.split('.').pop() || field
    return label.charAt(0).toUpperCase() + label.slice(1).replace(/([A-Z])/g, ' $1').trim()
  })

  // Format the data for the table
  const tableData = data.map(item => {
    return fields.map(field => {
      const value = field.split(".").reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : ""), item)
      if (value instanceof Date) {
        return value.toLocaleDateString()
      } else if (typeof value === "object" && value !== null) {
        return JSON.stringify(value)
      }
      return value
    })
  })

  // Create the table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 40,
    margin: { top: 40 },
    styles: { overflow: 'linebreak' },
    headStyles: { fillColor: [41, 128, 185] },
  })

  return doc.output('arraybuffer')
}

export async function POST(request: Request) {
  try {
    const { data, type, fields, format = "csv" } = await request.json()

    if (!data || !Array.isArray(data) || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    if (format === "csv") {
      const csv = convertToCSV(data, fields)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${type}-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else if (format === "pdf") {
      const pdfBuffer = convertToPDF(data, fields, type)
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${type}-export-${new Date().toISOString().split("T")[0]}.pdf"`,
        },
      })
    } else {
      return NextResponse.json({ error: "Unsupported export format" }, { status: 400 })
    }
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

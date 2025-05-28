"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { IBillingRecord, IClient } from "@/lib/types"

interface EngagementHeatmapProps {
  clients: IClient[]
  billingRecords: IBillingRecord[]
}

export function ClientEngagementHeatmap({ clients, billingRecords }: EngagementHeatmapProps) {
  // Calculate engagement score for each client
  const getEngagementScore = (client: IClient) => {
    const now = new Date()
    const lastUpdated = client.updatedAt ? new Date(client.updatedAt) : new Date(client.createdAt || 0)
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))

    // Recent billing activity
    const recentBillings = billingRecords.filter(
      (record) =>
        record.clientId === client._id &&
        record.billDate &&
        new Date(record.billDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    ).length

    // Calculate engagement score (0-100)
    let score = 100

    // Reduce score based on days since last update
    if (daysSinceUpdate > 30) score -= Math.min(50, daysSinceUpdate - 30)

    // Increase score based on recent billing activity
    score += Math.min(20, recentBillings * 5)

    // Adjust based on client status
    if (client.status === "active") score += 10
    else if (client.status === "paused") score -= 20
    else if (client.status === "inactive") score -= 30

    return Math.max(0, Math.min(100, score))
  }

  const engagementData = clients.map((client) => ({
    id: client._id,
    name: client.companyName || client.name,
    score: getEngagementScore(client),
    status: client.status,
    lastUpdated: client.updatedAt,
  }))

  // Create a grid layout for the heatmap
  const gridSize = Math.ceil(Math.sqrt(engagementData.length))
  const heatmapCells = []

  for (let i = 0; i < engagementData.length; i++) {
    const client = engagementData[i]
    const row = Math.floor(i / gridSize)
    const col = i % gridSize

    heatmapCells.push({
      ...client,
      x: col * 40,
      y: row * 40,
      color: getHeatmapColor(client.score),
    })
  }

  function getHeatmapColor(score: number) {
    if (score >= 80) return "#22c55e" // Green - High engagement
    if (score >= 60) return "#eab308" // Yellow - Medium engagement
    if (score >= 40) return "#f97316" // Orange - Low engagement
    return "#ef4444" // Red - Very low engagement
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Engagement Heatmap</CardTitle>
        <CardDescription>Visual representation of client activity and engagement levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>High (80-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Medium (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Low (40-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Very Low (0-39)</span>
          </div>
        </div>

        <div className="relative" style={{ height: `${Math.ceil(engagementData.length / gridSize) * 50}px` }}>
          <svg width="100%" height="100%" className="overflow-visible">
            {heatmapCells.map((cell, index) => (
              <g key={cell.id}>
                <rect
                  x={cell.x}
                  y={cell.y}
                  width="35"
                  height="35"
                  fill={cell.color}
                  rx="4"
                  className="cursor-pointer hover:opacity-80"
                >
                  <title>{`${cell.name}: ${Math.round(cell.score)}% engagement`}</title>
                </rect>
                <text
                  x={cell.x + 17.5}
                  y={cell.y + 22}
                  textAnchor="middle"
                  className="text-xs fill-white font-medium pointer-events-none"
                >
                  {Math.round(cell.score)}
                </text>
              </g>

            ))}
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium">High Engagement</div>
            <div className="text-muted-foreground">{engagementData.filter((c) => c.score >= 80).length} clients</div>
          </div>
          <div>
            <div className="font-medium">Medium Engagement</div>
            <div className="text-muted-foreground">
              {engagementData.filter((c) => c.score >= 60 && c.score < 80).length} clients
            </div>
          </div>
          <div>
            <div className="font-medium">Needs Attention</div>
            <div className="text-muted-foreground">{engagementData.filter((c) => c.score < 60).length} clients</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

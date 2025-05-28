"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { IBillingRecord, IClient } from "@/lib/types"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

interface PaymentForecastingProps {
  billingRecords: IBillingRecord[]
  clients: IClient[]
}

export function PaymentForecasting({ billingRecords, clients }: PaymentForecastingProps) {
  // Calculate monthly revenue trend
  const getMonthlyRevenue = () => {
    const monthlyData: Record<string, number> = {}

    billingRecords.forEach((record) => {
      if (!record.billDate) return

      const monthKey = new Date(record.billDate).toISOString().substring(0, 7) // YYYY-MM
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + record.amount
    })

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month,
        revenue,
        date: new Date(month + "-01").toLocaleDateString(undefined, { month: "short", year: "numeric" }),
      }))
  }

  // Predict future revenue based on trends
  const getForecastData = () => {
    const monthlyRevenue = getMonthlyRevenue()

    if (monthlyRevenue.length < 3) {
      return []
    }

    // Calculate trend using simple linear regression
    const recentMonths = monthlyRevenue.slice(-6) // Last 6 months
    const avgGrowth =
      recentMonths.reduce((acc, curr, index) => {
        if (index === 0) return 0
        const growth = (curr.revenue - recentMonths[index - 1].revenue) / recentMonths[index - 1].revenue
        return acc + growth
      }, 0) /
      (recentMonths.length - 1)

    // Generate forecast for next 6 months
    const forecast = []
    const lastMonth = recentMonths[recentMonths.length - 1]
    let lastRevenue = lastMonth.revenue

    for (let i = 1; i <= 6; i++) {
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + i)

      lastRevenue = lastRevenue * (1 + avgGrowth)

      forecast.push({
        month: futureDate.toISOString().substring(0, 7),
        revenue: Math.max(0, lastRevenue),
        date: futureDate.toLocaleDateString(undefined, { month: "short", year: "numeric" }),
        type: "forecast",
      })
    }

    return [...recentMonths.map((m) => ({ ...m, type: "actual" })), ...forecast]
  }

  // Calculate upcoming payments
  const getUpcomingPayments = () => {
    const upcoming: {
      client: string
      amount: number
      dueDate: Date
      type: "recurring" | "invoice"
    }[] = []
    const now = new Date()

    // Recurring payments from active clients
    clients.forEach((client) => {
      if (client.status === "active" && client.billingPlan?.model === "monthly" && client.billingPlan.nextDue) {
        const nextDue = new Date(client.billingPlan.nextDue)
        if (nextDue > now && nextDue <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) {
          upcoming.push({
            client: client.companyName || client.name,
            amount: client.billingPlan.amount || 0,
            dueDate: nextDue,
            type: "recurring",
          })
        }
      }
    })

    // Unpaid invoices
    billingRecords.forEach((record) => {
      if (record.paymentStatus === "unpaid" && record.dueDate) {
        const client = clients.find((c) => c._id === record.clientId)
        upcoming.push({
          client: client?.companyName || client?.name || "Unknown",
          amount: record.amount,
          dueDate: new Date(record.dueDate),
          type: "invoice",
        })
      }
    })

    return upcoming.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 10)
  }

  const forecastData = getForecastData()
  const upcomingPayments = getUpcomingPayments()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
          <CardDescription>Predicted revenue based on historical trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  strokeDasharray={`${(entry: any) => (entry?.type === "forecast" ? "5 5" : "0")}`}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            Dashed line indicates forecasted revenue based on recent trends
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Expected payments in the next 90 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{payment.client}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.dueDate.toLocaleDateString()} • {payment.type}
                    </div>
                  </div>
                  <div className="font-medium">${payment.amount.toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">No upcoming payments scheduled</div>
            )}
          </div>

          {upcomingPayments.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Expected</span>
                <span className="font-bold text-lg">
                  ${upcomingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { IBillingRecord, IClient } from "@/lib/types"
import { AlertCircle, DollarSign, FileText, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

export function BillingAnalytics() {
  const [billingRecords, setBillingRecords] = useState<IBillingRecord[]>([])
  const [clients, setClients] = useState<IClient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [billingResponse, clientsResponse] = await Promise.all([fetch("/api/bill"), fetch("/api/client")])

      if (billingResponse.ok && clientsResponse.ok) {
        const [billingData, clientsData] = await Promise.all([billingResponse.json(), clientsResponse.json()])
        setBillingRecords(billingData)
        setClients(clientsData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const totalRevenue = billingRecords.reduce((sum, record) => sum + (record?.amount || 0), 0)
  const paidAmount = billingRecords
    .filter((record) => record && record.paymentStatus === "paid")
    .reduce((sum, record) => sum + (record?.amount || 0), 0)
  const unpaidAmount = billingRecords
    .filter((record) => record && record.paymentStatus === "unpaid")
    .reduce((sum, record) => sum + (record?.amount || 0), 0)
  const overdueAmount = billingRecords
    .filter((record) => record && record.paymentStatus === "overdue")
    .reduce((sum, record) => sum + (record?.amount || 0), 0)

  const totalInvoices = billingRecords.length
  const paidInvoices = billingRecords.filter((record) => record && record.paymentStatus === "paid").length
  const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0

  // Payment status distribution
  const paymentStatusData = [
    { name: "Paid", value: billingRecords.filter((r) => r && r.paymentStatus === "paid").length, color: "#10b981" },
    { name: "Unpaid", value: billingRecords.filter((r) => r && r.paymentStatus === "unpaid").length, color: "#f59e0b" },
    { name: "Overdue", value: billingRecords.filter((r) => r && r.paymentStatus === "overdue").length, color: "#ef4444" },
    {
      name: "Cancelled",
      value: billingRecords.filter((r) => r && r.paymentStatus === "cancelled").length,
      color: "#6b7280",
    },
  ]

  // Monthly revenue trend
  const monthlyRevenue = billingRecords.reduce(
    (acc, record) => {
      if (!record) return acc;
      const month = new Date(record.billDate || record.createdAt || new Date()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
      acc[month] = (acc[month] || 0) + (record.amount || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  const revenueChartData = Object.entries(monthlyRevenue)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

  // Top services by revenue
  const serviceRevenue = billingRecords.reduce(
    (acc, record) => {
      if (!record || !record.servicesBilled) return acc;
      record.servicesBilled?.forEach((service) => {
        if (!service || !service.service) return;
        acc[service.service] = (acc[service.service] || 0) + (service.cost || 0)
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const topServicesData = Object.entries(serviceRevenue)
    .map(([service, revenue]) => ({ service, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {totalInvoices} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{paidInvoices} paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{unpaidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Payment success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                amount: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-amount)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-amount)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Payment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Distribution of invoice statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                paid: { label: "Paid", color: "#10b981" },
                unpaid: { label: "Unpaid", color: "#f59e0b" },
                overdue: { label: "Overdue", color: "#ef4444" },
                cancelled: { label: "Cancelled", color: "#6b7280" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Services and Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <Card>
          <CardHeader>
            <CardTitle>Top Services by Revenue</CardTitle>
            <CardDescription>Highest earning service categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServicesData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="service" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Statistics</CardTitle>
            <CardDescription>Key business metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Clients</span>
              <Badge variant="secondary">{clients.filter((c) => c && c.status === "active").length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Clients</span>
              <Badge variant="outline">{clients.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overdue Amount</span>
              <Badge variant="destructive">₹{overdueAmount.toLocaleString()}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Average Invoice</span>
              <Badge variant="secondary">
                ₹{totalInvoices > 0 ? Math.round(totalRevenue / totalInvoices).toLocaleString() : "0"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">This Month's Revenue</span>
              <Badge variant="default">
                ₹{revenueChartData[revenueChartData.length - 1]?.amount.toLocaleString() || "0"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

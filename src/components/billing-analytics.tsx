"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { sendBulkReminders } from "@/lib/actions/bulk-email-actions"
import { sendInvoiceReminder } from "@/lib/actions/email-actions"
import type { IBillingRecord, IClient } from "@/lib/types"
import {
  AlertTriangle,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Mail,
  Search,
  TrendingUp,
  Users,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { ClientEngagementHeatmap } from "./client-engagement-heatmap"
import { PaymentForecasting } from "./payment-forecasting"

export function BillingAnalytics() {
  const [billingRecords, setBillingRecords] = useState<IBillingRecord[]>([])
  const [clients, setClients] = useState<IClient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<IBillingRecord | null>(null)
  const [exportLoading, setExportLoading] = useState(false)
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [bulkEmailLoading, setBulkEmailLoading] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const [billingResponse, clientsResponse] = await Promise.all([fetch("/api/bill"), fetch("/api/client")])

      if (billingResponse.ok && clientsResponse.ok) {
        const [billingData, clientsData] = await Promise.all([billingResponse.json(), clientsResponse.json()])
        setBillingRecords(Array.isArray(billingData.data) ? billingData.data : [])
        setClients(Array.isArray(clientsData.data) ? clientsData.data : [])
      }
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Calculate metrics
  const totalRevenue = billingRecords.reduce((sum, record) => {
    if (currencyFilter === "all" || record.currency === currencyFilter) {
      return sum + record.amount
    }
    return sum
  }, 0)

  const paidRevenue = billingRecords
    .filter((record) => record.paymentStatus === "paid")
    .reduce((sum, record) => sum + record.amount, 0)

  const unpaidRevenue = billingRecords
    .filter((record) => record.paymentStatus === "unpaid")
    .reduce((sum, record) => sum + record.amount, 0)

  const overdueRevenue = billingRecords
    .filter((record) => record.paymentStatus === "overdue")
    .reduce((sum, record) => sum + record.amount, 0)

  const activeClients = clients.filter((client) => client.status === "active").length
  const totalInvoices = billingRecords.length
  const overdueInvoices = billingRecords.filter((record) => record.paymentStatus === "overdue").length

  // Revenue by service data
  const serviceRevenue = billingRecords.reduce(
    (acc, record) => {
      record.servicesBilled?.forEach((service) => {
        acc[service.service] = (acc[service.service] || 0) + (service.cost || 0)
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const serviceRevenueData = Object.entries(serviceRevenue).map(([service, amount]) => ({
    service,
    amount,
    fill: `hsl(var(--chart-${Object.keys(serviceRevenue).indexOf(service) + 1}))`,
  }))

  // Revenue by payment status
  const paymentStatusData = [
    { status: "Paid", amount: paidRevenue, fill: "hsl(var(--chart-1))" },
    { status: "Unpaid", amount: unpaidRevenue, fill: "hsl(var(--chart-2))" },
    { status: "Overdue", amount: overdueRevenue, fill: "hsl(var(--chart-3))" },
  ]

  // Revenue over time
  const revenueOverTime = billingRecords
    .sort((a, b) => new Date(a.billDate || 0).getTime() - new Date(b.billDate || 0).getTime())
    .map((record) => ({
      date: new Date(record.billDate || 0).toLocaleDateString(),
      amount: record.amount,
      status: record.paymentStatus,
    }))

  // Top clients by revenue
  const clientRevenue = billingRecords.reduce(
    (acc, record) => {
      const client = clients.find((c) => c._id === record.clientId)
      const clientName = client?.companyName || client?.name || "Unknown"
      acc[clientName] = (acc[clientName] || 0) + record.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const topClientsData = Object.entries(clientRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([client, amount]) => ({ client, amount }))

  // Filter billing records
  const filteredBillingRecords = billingRecords.filter((record) => {
    const client = clients.find((c) => c._id === record.clientId)
    const clientName = client?.companyName || client?.name || ""

    const matchesSearch =
      searchTerm === "" ||
      record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || record.paymentStatus === statusFilter
    const matchesCurrency = currencyFilter === "all" || record.currency === currencyFilter

    return matchesSearch && matchesStatus && matchesCurrency
  })

  const exportData = async (type: string) => {
    try {
      setExportLoading(true)

      let data
      let fields

      if (type === "invoices") {
        data = filteredBillingRecords
        fields = ["invoiceNumber", "clientId", "amount", "currency", "paymentStatus", "billDate", "dueDate"]
      } else if (type === "clients") {
        data = clients
        fields = ["name", "companyName", "email", "status", "billingPlan.model", "billingPlan.amount"]
      } else if (type === "revenue") {
        data = revenueOverTime
        fields = ["date", "amount", "status"]
      } else {
        throw new Error("Invalid export type")
      }

      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data, type, fields }),
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      // Create a download link for the CSV
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${type}-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: `${type} data has been exported to CSV`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  const sendEmail = async (invoice: IBillingRecord) => {
    try {
      setSendingEmail(true)
      const client = clients.find((c) => c._id === invoice.clientId)

      if (!client) {
        throw new Error("Client not found")
      }

      const result = await sendInvoiceReminder(
        invoice.clientId,
        invoice._id || "",
        client.email,
        client.name,
        invoice.invoiceNumber,
        invoice.amount,
        invoice.currency || "USD",
        invoice.dueDate || new Date(),
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Email sent successfully",
        description: `Payment reminder sent to ${client.name}`,
      })
    } catch (error: any) {
      console.error("Email error:", error)
      toast({
        title: "Failed to send email",
        description: error.message || "There was an error sending the email",
        variant: "destructive",
      })
    } finally {
      setSendingEmail(false)
      setSelectedInvoice(null)
    }
  }

  const sendBulkEmails = async () => {
    try {
      setBulkEmailLoading(true)

      const selectedRecords = billingRecords.filter(
        (record) => selectedInvoices.includes(record._id || "") && record.paymentStatus === "overdue",
      )

      if (selectedRecords.length === 0) {
        throw new Error("No overdue invoices selected")
      }

      const result = await sendBulkReminders(selectedRecords, clients)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: "Bulk emails sent",
        description: `${result.summary.successful} emails sent successfully, ${result.summary.failed} failed`,
      })

      setSelectedInvoices([])
    } catch (error: any) {
      console.error("Bulk email error:", error)
      toast({
        title: "Failed to send bulk emails",
        description: error.message || "There was an error sending the emails",
        variant: "destructive",
      })
    } finally {
      setBulkEmailLoading(false)
    }
  }

  // Calculate client lifetime value
  const calculateClientLTV = useCallback(
    (clientId: string) => {
      const clientBillings = billingRecords.filter((record) => record.clientId === clientId)
      const totalBilled = clientBillings.reduce((sum, record) => sum + record.amount, 0)
      const clientAge = clients.find((c) => c._id === clientId)?.createdAt
        ? (new Date().getTime() - new Date(clients.find((c) => c._id === clientId)?.createdAt || 0).getTime()) /
        (1000 * 60 * 60 * 24 * 30)
        : 1

      // Monthly LTV = Total billed / months as client
      return clientAge > 0 ? totalBilled / clientAge : totalBilled
    },
    [billingRecords, clients],
  )

  // Calculate client risk score (0-100, higher is riskier)
  const calculateClientRiskScore = useCallback(
    (clientId: string) => {
      const client = clients.find((c) => c._id === clientId)
      const clientBillings = billingRecords.filter((record) => record.clientId === clientId)

      if (!client || clientBillings.length === 0) return 0

      // Factors that increase risk
      const overdueInvoices = clientBillings.filter((record) => record.paymentStatus === "overdue").length
      const isPaused = client.status === "paused" ? 20 : 0
      const recentActivity = client.updatedAt
        ? Math.min(
          100,
          ((new Date().getTime() - new Date(client.updatedAt).getTime()) / (1000 * 60 * 60 * 24 * 30)) * 10,
        )
        : 0

      // Calculate risk score (0-100)
      const riskScore = Math.min(100, overdueInvoices * 25 + isPaused + recentActivity)

      return riskScore
    },
    [billingRecords, clients],
  )

  // Identify high-risk clients
  const highRiskClients = clients
    .map((client) => ({
      ...client,
      riskScore: calculateClientRiskScore(client._id || ""),
      ltv: calculateClientLTV(client._id || ""),
    }))
    .filter((client) => client.riskScore > 50)
    .sort((a, b) => b.riskScore - a.riskScore)

  // Calculate revenue growth rate
  const calculateRevenueGrowth = () => {
    // Group billing records by month
    const monthlyRevenue: Record<string, number> = {}

    billingRecords.forEach((record) => {
      if (!record.billDate) return

      const monthYear = new Date(record.billDate).toISOString().substring(0, 7) // YYYY-MM format
      monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + record.amount
    })

    // Sort months
    const sortedMonths = Object.keys(monthlyRevenue).sort()

    if (sortedMonths.length < 2) return { rate: 0, current: 0, previous: 0 }

    const currentMonth = sortedMonths[sortedMonths.length - 1]
    const previousMonth = sortedMonths[sortedMonths.length - 2]

    const currentRevenue = monthlyRevenue[currentMonth]
    const previousRevenue = monthlyRevenue[previousMonth]

    const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 100

    return {
      rate: growthRate,
      current: currentRevenue,
      previous: previousRevenue,
      currentMonth,
      previousMonth,
    }
  }

  const revenueGrowth = calculateRevenueGrowth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading analytics data...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Revenue insights and client analytics</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="invoices" onValueChange={(value) => exportData(value)} disabled={exportLoading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Export Data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="invoices">Export Invoices</SelectItem>
              <SelectItem value="clients">Export Clients</SelectItem>
              <SelectItem value="revenue">Export Revenue</SelectItem>
            </SelectContent>
          </Select>
          <Button disabled={exportLoading}>
            {exportLoading ? (
              "Exporting..."
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClients}</div>
            <p className="text-xs text-muted-foreground">{clients.length} total clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {billingRecords.filter((r) => r.paymentStatus === "paid").length} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">${overdueRevenue.toLocaleString()} overdue</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="clients">Client Insights</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Management</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service</CardTitle>
                <CardDescription>Breakdown of revenue by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    amount: { label: "Amount", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="service" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="amount" fill="var(--color-amount)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
                <CardDescription>Revenue breakdown by payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    amount: { label: "Amount" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        dataKey="amount"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                      >
                        {paymentStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList dataKey="status" position="outside" />
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Clients by Revenue</CardTitle>
              <CardDescription>Highest revenue generating clients</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: { label: "Amount", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topClientsData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="client" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="amount" fill="var(--color-amount)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  {revenueGrowth.rate > 0 ? "+" : ""}
                  {revenueGrowth.rate.toFixed(1)}%
                  <span className={`text-sm ml-2 ${revenueGrowth.rate >= 0 ? "text-green-500" : "text-red-500"}`}>
                    vs previous month
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(revenueGrowth.currentMonth + "-01").toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Currency Impact</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.entries(
                    billingRecords.reduce(
                      (acc, record) => {
                        const currency = record.currency || "USD"
                        acc[currency] = (acc[currency] || 0) + record.amount
                        return acc
                      },
                      {} as Record<string, number>,
                    ),
                  ).map(([currency, amount], index) => (
                    <div key={currency} className={index > 0 ? "mt-1" : ""}>
                      <span className="text-sm font-normal">{currency}:</span> {amount.toLocaleString()}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Reminders</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    billingRecords.filter(
                      (record) =>
                        record.paymentStatus === "unpaid" &&
                        record.dueDate &&
                        new Date(record.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Payments due in the next 7 days</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Revenue trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  amount: { label: "Amount", color: "hsl(var(--chart-1))" },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["active", "onboarding", "paused", "lead"].map((status) => {
                  const count = clients.filter((c) => c.status === status).length
                  return (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Models</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["monthly", "one-time", "retainer"].map((model) => {
                  const count = clients.filter((c) => c.billingPlan?.model === model).length
                  return (
                    <div key={model} className="flex justify-between items-center">
                      <span className="capitalize">{model}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Overdue Payments</span>
                  <Badge variant="destructive">{overdueInvoices}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>High-Risk Clients</span>
                  <Badge variant="destructive">{highRiskClients.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Paused Clients</span>
                  <Badge variant="outline">{clients.filter((c) => c.status === "paused").length}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client LTV Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Client Lifetime Value (LTV)</CardTitle>
              <CardDescription>Monthly value based on billing history</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  ltv: { label: "Monthly LTV", color: "hsl(var(--chart-2))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={clients
                      .filter((client) => client.status === "active")
                      .map((client) => ({
                        name: client.companyName || client.name,
                        ltv: Math.round(calculateClientLTV(client._id || "")),
                      }))
                      .sort((a, b) => b.ltv - a.ltv)
                      .slice(0, 10)}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="ltv" fill="var(--color-ltv)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* High-Risk Clients */}
          <Card>
            <CardHeader>
              <CardTitle>High-Risk Client Alerts</CardTitle>
              <CardDescription>Clients with risk factors that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              {highRiskClients.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Overdue Invoices</TableHead>
                      <TableHead>Monthly LTV</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highRiskClients.map((client) => {
                      const overdueCount = billingRecords.filter(
                        (record) => record.clientId === client._id && record.paymentStatus === "overdue",
                      ).length

                      return (
                        <TableRow key={client._id}>
                          <TableCell className="font-medium">{client.companyName || client.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className={`mr-2 ${client.riskScore > 75 ? "text-red-500" : "text-amber-500"}`}>
                                {Math.round(client.riskScore)}
                              </span>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${client.riskScore > 75 ? "bg-red-500" : "bg-amber-500"}`}
                                  style={{ width: `${client.riskScore}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={client.status === "paused" ? "destructive" : "outline"}>
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{overdueCount}</TableCell>
                          <TableCell>${Math.round(client.ltv)}/mo</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Mail className="h-4 w-4 mr-1" /> Contact
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">No high-risk clients detected</div>
              )}
            </CardContent>
          </Card>
          <ClientEngagementHeatmap clients={clients} billingRecords={billingRecords} />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>Search and filter invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices or clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
                {selectedInvoices.length > 0 && (
                  <Button onClick={sendBulkEmails} disabled={bulkEmailLoading} variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    {bulkEmailLoading ? "Sending..." : `Send ${selectedInvoices.length} Reminders`}
                  </Button>
                )}
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedInvoices.length ===
                            filteredBillingRecords.filter((r) => r.paymentStatus === "overdue").length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices(
                                filteredBillingRecords
                                  .filter((r) => r.paymentStatus === "overdue")
                                  .map((r) => r._id || ""),
                              )
                            } else {
                              setSelectedInvoices([])
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBillingRecords.map((record) => {
                      const client = clients.find((c) => c._id === record.clientId)
                      const clientName = client?.companyName || client?.name || "Unknown"

                      return (
                        <TableRow key={record._id}>
                          <TableCell>
                            {record.paymentStatus === "overdue" && (
                              <input
                                type="checkbox"
                                checked={selectedInvoices.includes(record._id || "")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedInvoices([...selectedInvoices, record._id || ""])
                                  } else {
                                    setSelectedInvoices(selectedInvoices.filter((id) => id !== record._id))
                                  }
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{record.invoiceNumber}</TableCell>
                          <TableCell>{clientName}</TableCell>
                          <TableCell>
                            {record.currency} {record.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.paymentStatus === "paid"
                                  ? "default"
                                  : record.paymentStatus === "overdue"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {record.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(record)}>
                                    <Mail className="h-4 w-4 mr-1" /> Email
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Send Payment Reminder</DialogTitle>
                                    <DialogDescription>
                                      Send a payment reminder email for invoice {selectedInvoice?.invoiceNumber}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="py-4">
                                    <p className="mb-2">
                                      <strong>Invoice:</strong> {selectedInvoice?.invoiceNumber}
                                    </p>
                                    <p className="mb-2">
                                      <strong>Client:</strong>{" "}
                                      {clients.find((c) => c._id === selectedInvoice?.clientId)?.name || "Unknown"}
                                    </p>
                                    <p className="mb-2">
                                      <strong>Amount:</strong> {selectedInvoice?.currency}{" "}
                                      {selectedInvoice?.amount.toLocaleString()}
                                    </p>
                                    <p>
                                      <strong>Due Date:</strong>{" "}
                                      {selectedInvoice?.dueDate
                                        ? new Date(selectedInvoice.dueDate).toLocaleDateString()
                                        : "N/A"}
                                    </p>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => selectedInvoice && sendEmail(selectedInvoice)}
                                      disabled={sendingEmail}
                                    >
                                      {sendingEmail ? "Sending..." : "Send Reminder"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="outline">
                                Download
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="forecasting" className="space-y-6">
          <PaymentForecasting billingRecords={billingRecords} clients={clients} />

          <ClientEngagementHeatmap clients={clients} billingRecords={billingRecords} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

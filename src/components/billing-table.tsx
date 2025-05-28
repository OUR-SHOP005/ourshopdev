"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Edit, Trash2, Search, ArrowUpDown, Filter, FileText, Download } from "lucide-react"
import type { IBillingRecord } from "@/lib/types"
import type { IClient } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { BillingViewModal } from "./billing-view-modal"
import { BillingEditModal } from "./billing-edit-modal"

interface BillingTableProps {
  refreshTrigger?: number
}

export function BillingTable({ refreshTrigger }: BillingTableProps) {
  const { toast } = useToast()
  const [billingRecords, setBillingRecords] = useState<IBillingRecord[]>([])
  const [clients, setClients] = useState<IClient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<keyof IBillingRecord>("billDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const [selectedBillingRecord, setSelectedBillingRecord] = useState<IBillingRecord | null>(null)
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [billingResponse, clientsResponse] = await Promise.all([fetch("/api/bill"), fetch("/api/client")])
      
      if (billingResponse.ok && clientsResponse.ok) {
        const [billingData, clientsData] = await Promise.all([billingResponse.json(), clientsResponse.json()])
        setBillingRecords(Array.isArray(billingData.data) ? billingData.data : [])
        setClients(Array.isArray(clientsData.data) ? clientsData.data : [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch billing records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c._id === clientId)
    return client ? `${client.name} (${client.companyName || client.email})` : "Unknown Client"
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this billing record?")) return

    try {
      const response = await fetch(`/api/bill/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete billing record")

      toast({
        title: "Success",
        description: "Billing record deleted successfully",
      })

      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete billing record",
        variant: "destructive",
      })
    }
  }

  const handleSort = (field: keyof IBillingRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDownloadPdf = (pdfUrl: string, invoiceNumber: string) => {
    // In a real implementation, this would download the actual PDF
    toast({
      title: "Download Started",
      description: `Downloading invoice ${invoiceNumber}`,
    })
    window.open(pdfUrl, "_blank")
  }

  const filteredAndSortedRecords = useMemo(() => {
    const filtered = billingRecords.filter((record) => {
      const clientName = getClientName(record.clientId).toLowerCase()
      const matchesSearch =
        record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || record.paymentStatus === statusFilter

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue === undefined || aValue === null) return 1
      if (bValue === undefined || bValue === null) return -1

      let comparison = 0
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1

      return sortDirection === "desc" ? -comparison : comparison
    })

    return filtered
  }, [billingRecords, clients, searchTerm, statusFilter, sortField, sortDirection])

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "unpaid":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading billing records...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Billing Records
        </CardTitle>
        <CardDescription>Manage invoices and billing history</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("invoiceNumber")}
                    className="h-auto p-0 font-semibold"
                  >
                    Invoice #
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Client</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold">
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("billDate")} className="h-auto p-0 font-semibold">
                    Bill Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("paymentStatus")}
                    className="h-auto p-0 font-semibold"
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRecords.map((record) => (
                <TableRow key={record._id}>
                  <TableCell className="font-medium">{record.invoiceNumber}</TableCell>
                  <TableCell>{getClientName(record.clientId)}</TableCell>
                  <TableCell>
                    {record.currency || "INR"} {record.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{record.billDate ? new Date(record.billDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.paymentStatus)}>{record.paymentStatus || "unpaid"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {record.servicesBilled?.slice(0, 2).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service.service}
                        </Badge>
                      ))}
                      {(record.servicesBilled?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(record.servicesBilled?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadPdf(record.billPdfUrl, record.invoiceNumber)}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const client = clients.find((c) => c._id === record.clientId)
                          setSelectedBillingRecord(record)
                          setSelectedClient(client || null)
                          setViewModalOpen(true)
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBillingRecord(record)
                          setEditModalOpen(true)
                        }}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(record._id!)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">No billing records found matching your criteria.</div>
        )}
      </CardContent>

      {/* Modals */}
      <BillingViewModal
        billingRecord={selectedBillingRecord}
        client={selectedClient}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />
      <BillingEditModal
        billingRecord={selectedBillingRecord}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onBillingUpdated={fetchData}
      />
    </Card>
  )
}

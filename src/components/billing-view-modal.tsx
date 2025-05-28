"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Phone, Mail, DollarSign, FileText, Download } from "lucide-react"
import type { IBillingRecord, IClient } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface BillingViewModalProps {
  billingRecord: IBillingRecord | null
  client: IClient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BillingViewModal({ billingRecord, client, open, onOpenChange }: BillingViewModalProps) {
  const { toast } = useToast()

  if (!billingRecord || !client) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    })
  }

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`)
  }

  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const downloadPdf = () => {
    window.open(billingRecord.billPdfUrl, "_blank")
    toast({
      title: "Download Started",
      description: `Downloading invoice ${billingRecord.invoiceNumber}`,
    })
  }

  const ActionButton = ({
    type,
    value,
    label,
  }: {
    type: "copy" | "phone" | "email" | "download"
    value: string
    label: string
  }) => {
    const handleClick = () => {
      switch (type) {
        case "copy":
          copyToClipboard(value, label)
          break
        case "phone":
          makeCall(value)
          break
        case "email":
          sendEmail(value)
          break
        case "download":
          downloadPdf()
          break
      }
    }

    const getIcon = () => {
      switch (type) {
        case "phone":
          return <Phone className="h-3 w-3" />
        case "email":
          return <Mail className="h-3 w-3" />
        case "download":
          return <Download className="h-3 w-3" />
        default:
          return <Copy className="h-3 w-3" />
      }
    }

    return (
      <Button variant="outline" size="sm" onClick={handleClick} className="ml-2">
        {getIcon()}
      </Button>
    )
  }

  const InfoRow = ({
    label,
    value,
    type = "copy",
  }: {
    label: string
    value?: string
    type?: "copy" | "phone" | "email" | "download"
  }) => {
    if (!value) return null

    return (
      <div className="flex items-center justify-between py-2 border-b last:border-b-0">
        <span className="font-medium text-sm text-gray-600">{label}:</span>
        <div className="flex items-center">
          <span className="text-sm">{value}</span>
          <ActionButton type={type} value={value} label={label} />
        </div>
      </div>
    )
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice {billingRecord.invoiceNumber}
            <Badge className={getStatusColor(billingRecord.paymentStatus)}>
              {billingRecord.paymentStatus || "unpaid"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow label="Invoice Number" value={billingRecord.invoiceNumber} />
              <InfoRow
                label="Amount"
                value={`${billingRecord.currency || "INR"} ${billingRecord.amount.toLocaleString()}`}
              />
              <InfoRow
                label="Bill Date"
                value={billingRecord.billDate ? new Date(billingRecord.billDate).toLocaleDateString() : undefined}
              />
              <InfoRow
                label="Due Date"
                value={billingRecord.dueDate ? new Date(billingRecord.dueDate).toLocaleDateString() : undefined}
              />
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium text-sm text-gray-600">PDF Invoice:</span>
                <ActionButton type="download" value={billingRecord.billPdfUrl} label="Download PDF" />
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow label="Name" value={client.name} />
              <InfoRow label="Company" value={client.companyName} />
              <InfoRow label="Email" value={client.email} type="email" />
              <InfoRow label="Phone" value={client.phone} type="phone" />
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium text-sm text-gray-600">Status:</span>
                <Badge className={getStatusColor(billingRecord.paymentStatus)}>
                  {billingRecord.paymentStatus || "unpaid"}
                </Badge>
              </div>
              <InfoRow label="Payment Method" value={billingRecord.paymentMethod} />
              <InfoRow label="Transaction ID" value={billingRecord.transactionId} />
              <InfoRow label="Currency" value={billingRecord.currency} />
            </CardContent>
          </Card>

          {/* Services Billed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Services Billed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {billingRecord.servicesBilled?.map((service, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{service.service}</Badge>
                      <span className="font-medium">
                        {billingRecord.currency || "INR"} {service.cost?.toLocaleString() || "0"}
                      </span>
                    </div>
                    {service.description && <p className="text-sm text-gray-600">{service.description}</p>}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold">
                    {billingRecord.currency || "INR"} {billingRecord.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {billingRecord.notes && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <p className="text-sm whitespace-pre-wrap flex-1">{billingRecord.notes}</p>
                  <ActionButton type="copy" value={billingRecord.notes} label="Notes" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {billingRecord.createdAt && (
                <InfoRow label="Created" value={new Date(billingRecord.createdAt).toLocaleString()} />
              )}
              {billingRecord.updatedAt && (
                <InfoRow label="Last Updated" value={new Date(billingRecord.updatedAt).toLocaleString()} />
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

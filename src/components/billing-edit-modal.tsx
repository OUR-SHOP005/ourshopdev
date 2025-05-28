"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { IBillingRecord, IServiceBilled } from "@/lib/types"
import { Plus, X } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"

interface BillingEditModalProps {
  billingRecord: IBillingRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBillingUpdated: () => void
}

export function BillingEditModal({ billingRecord, open, onOpenChange, onBillingUpdated }: BillingEditModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [servicesBilled, setServicesBilled] = useState<IServiceBilled[]>([])
  const [newService, setNewService] = useState<IServiceBilled>({
    service: "development",
    description: "",
    cost: 0,
  })

  const serviceOptions = [
    "design",
    "development",
    "SEO",
    "maintenance",
    "hosting",
    "domain",
    "analytics",
    "ecommerce",
    "other",
  ]

  const paymentStatusOptions = [
    { value: "unpaid", label: "Unpaid" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" },
  ]

  useEffect(() => {
    if (billingRecord) {
      setServicesBilled(billingRecord.servicesBilled || [])
    }
  }, [billingRecord])

  if (!billingRecord) return null

  const addService = () => {
    if (newService.service && newService.description && newService.cost && newService.cost > 0) {
      setServicesBilled([...servicesBilled, newService])
      setNewService({
        service: "development",
        description: "",
        cost: 0,
      })
    }
  }

  const removeService = (index: number) => {
    setServicesBilled(servicesBilled.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return servicesBilled.reduce((total, service) => total + (service.cost || 0), 0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const totalAmount = calculateTotal()

    const updatedData: Partial<IBillingRecord> = {
      amount: totalAmount,
      currency: (formData.get("currency") as string) || "INR",
      servicesBilled: servicesBilled,
      billDate: new Date(formData.get("billDate") as string),
      dueDate: new Date(formData.get("dueDate") as string),
      paymentStatus: formData.get("paymentStatus") as any,
      paymentMethod: formData.get("paymentMethod") as string,
      transactionId: formData.get("transactionId") as string,
      notes: formData.get("notes") as string,
    }

    try {
      const response = await fetch(`/api/bill/${billingRecord._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        throw new Error("Failed to update billing record")
      }

      toast({
        title: "Success",
        description: "Billing record updated successfully",
      })

      onBillingUpdated()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update billing record",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice: {billingRecord.invoiceNumber}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue={billingRecord.currency || "INR"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billDate">Bill Date *</Label>
              <Input
                id="billDate"
                name="billDate"
                type="date"
                defaultValue={
                  billingRecord.billDate
                    ? new Date(billingRecord.billDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={
                  billingRecord.dueDate
                    ? new Date(billingRecord.dueDate).toISOString().split("T")[0]
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                }
                readOnly
              />
            </div>
          </div>

          {/* Services Billed */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services Billed</h3>

            {/* Existing Services */}
            <div className="space-y-2">
              {servicesBilled.map((service, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <Badge variant="outline">{service.service}</Badge>
                  <span className="flex-1">{service.description}</span>
                  <span className="font-medium">₹{service.cost}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeService(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add New Service */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg bg-muted/50">
              <Select
                value={newService.service}
                onValueChange={(value) => setNewService({ ...newService, service: value as any })}
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Cost"
                value={newService.cost || ""}
                onChange={(e) => setNewService({ ...newService, cost: Number(e.target.value) })}
              />
              <Button type="button" onClick={addService}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Total */}
            {servicesBilled.length > 0 && (
              <div className="flex justify-end">
                <div className="text-lg font-semibold">Total: ₹{calculateTotal().toLocaleString()}</div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select name="paymentStatus" defaultValue={billingRecord.paymentStatus || "unpaid"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                name="paymentMethod"
                placeholder="e.g., Bank Transfer, UPI"
                defaultValue={billingRecord.paymentMethod || ""}
                readOnly
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                name="transactionId"
                placeholder="Transaction reference number"
                defaultValue={billingRecord.transactionId || ""}
                readOnly
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Additional notes or terms..."
              defaultValue={billingRecord.notes || ""}
              readOnly
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { IBillingRecord, IClient, IServiceBilled } from "@/lib/types"
import { BillingRecordSchema } from "@/lib/types"
import { FileText, Loader2, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { ZodError } from "zod"

interface BillingFormProps {
  onBillingCreated?: () => void
}

export function BillingForm({ onBillingCreated }: BillingFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [clients, setClients] = useState<IClient[]>([])
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null)
  const [servicesBilled, setServicesBilled] = useState<IServiceBilled[]>([])
  const [newService, setNewService] = useState<IServiceBilled>({
    service: "development",
    description: "",
    cost: 0,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/client")
      if (!response.ok) throw new Error("Failed to fetch clients")
      const json = await response.json()
      setClients(Array.isArray(json.data) ? json.data : [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      })
    }
  }

  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `INV-${year}${month}-${random}`
  }

  const addService = () => {
    if (newService.service && newService.description && newService.cost && newService.cost > 0) {
      setServicesBilled([...servicesBilled, newService])
      setNewService({
        service: "development",
        description: "",
        cost: 0,
      })
    } else {
      // Show validation error for service fields
      let errorMsg = "";
      if (!newService.description) errorMsg = "Service description is required";
      else if (!newService.cost || newService.cost <= 0) errorMsg = "Service cost must be greater than 0";

      toast({
        title: "Validation Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  }

  const removeService = (index: number) => {
    setServicesBilled(servicesBilled.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return servicesBilled.reduce((total, service) => total + (service.cost || 0), 0)
  }

  // Helper function to show field error message
  const getFieldError = (field: string) => {
    return formErrors[field] ? (
      <p className="text-sm text-destructive mt-1">{formErrors[field]}</p>
    ) : null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormErrors({});

    if (!selectedClient) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      })
      setFormErrors({ clientId: "Please select a client" });
      return
    }

    if (servicesBilled.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one service",
        variant: "destructive",
      })
      setFormErrors({ servicesBilled: "Please add at least one service" });
      return
    }

    setLoading(true)
    setPdfGenerating(true)

    const formData = new FormData(e.currentTarget)
    const totalAmount = calculateTotal()

    const billingData: Omit<IBillingRecord, "_id" | "billPdfUrl" | "createdAt" | "updatedAt"> = {
      clientId: selectedClient?._id || "",
      invoiceNumber: formData.get("invoiceNumber") as string,
      amount: totalAmount,
      currency: (formData.get("currency") as string) || "INR",
      servicesBilled: servicesBilled,
      billDate: new Date(formData.get("billDate") as string),
      dueDate: formData.get("dueDate") as string ? new Date(formData.get("dueDate") as string) : undefined,
      paymentStatus: formData.get("paymentStatus") as any,
      paymentMethod: formData.get("paymentMethod") as string,
      transactionId: formData.get("transactionId") as string,
      notes: formData.get("notes") as string,
    }

    try {
      // Validate with Zod before proceeding
      try {
        BillingRecordSchema.parse({
          ...billingData,
          billPdfUrl: "placeholder", // Temporary placeholder for validation
        });
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          const errors: Record<string, string> = {};
          validationError.errors.forEach((err) => {
            const fieldPath = err.path.join('.');
            errors[fieldPath] = err.message;
          });
          setFormErrors(errors);

          setPdfGenerating(false);
          setLoading(false);

          toast({
            title: "Validation Error",
            description: "Please check the form for errors",
            variant: "destructive",
          });
          return;
        }
      }

      // Step 1: Generate PDF
      toast({
        title: "Generating PDF",
        description: "Creating billing PDF...",
      })

      const pdfResponse = await fetch("/api/savebillingpdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billingData),
      })

      if (!pdfResponse.ok) {
        throw new Error("Failed to generate PDF")
      }

      const { pdfUrl } = await pdfResponse.json()
      setPdfGenerating(false)

      // Step 2: Save billing record with PDF URL
      toast({
        title: "Saving Record",
        description: "Saving billing record to database...",
      })

      const billResponse = await fetch("/api/bill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...billingData,
          billPdfUrl: pdfUrl,
        }),
      })

      if (!billResponse.ok) {
        throw new Error("Failed to save billing record")
      }

      // Step 3: Send email to client
      toast({
        title: "Sending Email",
        description: "Sending invoice email to client...",
      })

      try {
        const emailResponse = await fetch("/api/send-invoice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            billingData: { ...billingData, billPdfUrl: pdfUrl },
            clientData: selectedClient,
            pdfUrl: pdfUrl,
          }),
        })

        if (emailResponse.ok) {
          toast({
            title: "Success",
            description: "Billing record created and email sent successfully",
          })

        } else {
          toast({
            title: "Partial Success",
            description: "Billing record created but email failed to send",
            variant: "destructive",
          })
        }
      } catch (emailError) {
        toast({
          title: "Partial Success",
          description: "Billing record created but email failed to send",
          variant: "destructive",
        })
      }

      // Reset form
      e.currentTarget.reset()
      setSelectedClient(null)
      setServicesBilled([])
      setNewService({
        service: "development",
        description: "",
        cost: 0,
      })

      onBillingCreated?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create billing record",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setPdfGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Create New Bill
        </CardTitle>
        <CardDescription>Generate a new billing record and PDF invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Select Client *</Label>
            <Select
              onValueChange={(value) => {
                const client = clients.find((c) => c._id === value)
                setSelectedClient(client || null)
              }}
            >
              <SelectTrigger className={formErrors["clientId"] ? "border-destructive" : ""}>
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client._id} value={client._id!}>
                    {client.name} - {client.companyName || client.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("clientId")}
          </div>

          {selectedClient && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Client:</span> {selectedClient.name}
                  </div>
                  <div>
                    <span className="font-medium">Company:</span> {selectedClient.companyName || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedClient.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedClient.phone || "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                defaultValue={generateInvoiceNumber()}
                required
                className={formErrors["invoiceNumber"] ? "border-destructive" : ""}
              />
              {getFieldError("invoiceNumber")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                name="currency"
                defaultValue="INR"
                className={formErrors["currency"] ? "border-destructive" : ""}
              />
              {getFieldError("currency")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="billDate">Bill Date *</Label>
              <Input
                id="billDate"
                name="billDate"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
                className={formErrors["billDate"] ? "border-destructive" : ""}
              />
              {getFieldError("billDate")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                className={formErrors["dueDate"] ? "border-destructive" : ""}
              />
              {getFieldError("dueDate")}
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
            {formErrors["servicesBilled"] && (
              <p className="text-sm text-destructive">{formErrors["servicesBilled"]}</p>
            )}

            {/* Add New Service */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 border rounded-lg bg-muted/50">
              <Select
                value={newService.service}
                onValueChange={(value) => setNewService({ ...newService, service: value as any })}
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
              <Select name="paymentStatus" defaultValue="unpaid">
                <SelectTrigger className={formErrors["paymentStatus"] ? "border-destructive" : ""}>
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
              {getFieldError("paymentStatus")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                name="paymentMethod"
                placeholder="e.g., Bank Transfer, UPI"
                className={formErrors["paymentMethod"] ? "border-destructive" : ""}
              />
              {getFieldError("paymentMethod")}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                name="transactionId"
                placeholder="Transaction reference number"
                className={formErrors["transactionId"] ? "border-destructive" : ""}
              />
              {getFieldError("transactionId")}
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
              className={formErrors["notes"] ? "border-destructive" : ""}
            />
            {getFieldError("notes")}
          </div>

          <Button type="submit" disabled={loading || !selectedClient} className="w-full">
            {pdfGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Create Bill & Generate PDF"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

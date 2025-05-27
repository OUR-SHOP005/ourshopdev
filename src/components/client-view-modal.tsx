"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Phone, Mail, ExternalLink, Calendar, DollarSign } from "lucide-react"
import type { IClient } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ClientViewModalProps {
  client: IClient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientViewModal({ client, open, onOpenChange }: ClientViewModalProps) {
  const { toast } = useToast()

  if (!client) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    })
  }

  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`)
  }

  const openUrl = (url: string) => {
    window.open(url, "_blank")
  }

  const ActionButton = ({
    type,
    value,
    label,
  }: {
    type: "copy" | "phone" | "email" | "url"
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
        case "url":
          openUrl(value)
          break
      }
    }

    const getIcon = () => {
      switch (type) {
        case "phone":
          return <Phone className="h-3 w-3" />
        case "email":
          return <Mail className="h-3 w-3" />
        case "url":
          return <ExternalLink className="h-3 w-3" />
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
    type?: "copy" | "phone" | "email" | "url"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {client.name}
            {client.status && (
              <Badge
                className={
                  client.status === "active"
                    ? "bg-green-100 text-green-800"
                    : client.status === "lead"
                      ? "bg-blue-100 text-blue-800"
                      : client.status === "onboarding"
                        ? "bg-yellow-100 text-yellow-800"
                        : client.status === "paused"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                }
              >
                {client.status}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoRow label="Name" value={client.name} />
              <InfoRow label="Company" value={client.companyName} />
              <InfoRow label="Email" value={client.email} type="email" />
              <InfoRow label="Phone" value={client.phone} type="phone" />
            </CardContent>
          </Card>

          {/* Address */}
          {client.address && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow label="Street" value={client.address.street} />
                <InfoRow label="City" value={client.address.city} />
                <InfoRow label="State" value={client.address.state} />
                <InfoRow label="Country" value={client.address.country} />
                <InfoRow label="Postal Code" value={client.address.postalCode} />
              </CardContent>
            </Card>
          )}

          {/* Point of Contact */}
          {client.pointOfContact && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Point of Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow label="Name" value={client.pointOfContact.name} />
                <InfoRow label="Role" value={client.pointOfContact.role} />
                <InfoRow label="Phone" value={client.pointOfContact.phone} type="phone" />
                <InfoRow label="Email" value={client.pointOfContact.email} type="email" />
              </CardContent>
            </Card>
          )}

          {/* Website */}
          {client.website && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Website</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow label="URL" value={client.website.url} type="url" />
                <InfoRow label="Domain Provider" value={client.website.domainProvider} />
                <InfoRow label="Hosting Provider" value={client.website.hostingProvider} />
                <InfoRow label="Mail Address" value={client.website.mailAddress} type="email" />
                {client.website.status && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="font-medium text-sm text-gray-600">Status:</span>
                    <Badge variant="outline">{client.website.status}</Badge>
                  </div>
                )}
                {client.website.stack && client.website.stack.length > 0 && (
                  <div className="py-2 border-b">
                    <span className="font-medium text-sm text-gray-600 block mb-2">Tech Stack:</span>
                    <div className="flex flex-wrap gap-1">
                      {client.website.stack.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Services */}
          {client.services && client.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {client.services.map((service, index) => (
                    <Badge key={index} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Profiles */}
          {client.social && client.social.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {client.social.map((profile, index) => (
                  <InfoRow key={index} label={profile.platform} value={profile.url} type="url" />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Billing */}
          {client.billingPlan && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow label="Model" value={client.billingPlan.model} />
                <InfoRow
                  label="Amount"
                  value={
                    client.billingPlan.amount
                      ? `${client.billingPlan.currency || "INR"} ${client.billingPlan.amount}`
                      : undefined
                  }
                />
                {client.billingPlan.nextDue && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="font-medium text-sm text-gray-600">Next Due:</span>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{new Date(client.billingPlan.nextDue).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {client.tags && client.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {client.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {client.notes && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <p className="text-sm whitespace-pre-wrap flex-1">{client.notes}</p>
                  <ActionButton type="copy" value={client.notes} label="Notes" />
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
              {client.createdAt && <InfoRow label="Created" value={new Date(client.createdAt).toLocaleString()} />}
              {client.updatedAt && <InfoRow label="Last Updated" value={new Date(client.updatedAt).toLocaleString()} />}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

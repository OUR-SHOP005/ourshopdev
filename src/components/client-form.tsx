"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import type { Client } from "@/types/client"
import { useToast } from "@/hooks/use-toast"

interface ClientFormProps {
  onClientAdded?: () => void
}

export function ClientForm({ onClientAdded }: ClientFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [socialProfiles, setSocialProfiles] = useState<{ platform: string; url: string }[]>([])
  const [newTag, setNewTag] = useState("")
  const [newSocial, setNewSocial] = useState({ platform: "", url: "" })

  const serviceOptions = [
    "design",
    "development",
    "SEO",
    "maintenance",
    "hosting",
    "domain",
    "analytics",
    "ecommerce",
    "consultation",
  ]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const clientData: Omit<Client, "_id" | "createdAt" | "updatedAt"> = {
      name: formData.get("name") as string,
      companyName: formData.get("companyName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: {
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        country: formData.get("country") as string,
        postalCode: formData.get("postalCode") as string,
      },
      pointOfContact: {
        name: formData.get("pocName") as string,
        role: formData.get("pocRole") as string,
        phone: formData.get("pocPhone") as string,
        email: formData.get("pocEmail") as string,
      },
      website: {
        url: formData.get("websiteUrl") as string,
        stack:
          (formData.get("stack") as string)
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
        domainProvider: formData.get("domainProvider") as string,
        hostingProvider: formData.get("hostingProvider") as string,
        status: formData.get("websiteStatus") as any,
        mailAddress: formData.get("mailAddress") as string,
      },
      services: services as any[],
      social: socialProfiles,
      billingPlan: {
        model: formData.get("billingModel") as any,
        amount: formData.get("amount") ? Number(formData.get("amount")) : undefined,
        currency: (formData.get("currency") as string) || "INR",
      },
      status: formData.get("status") as any,
      notes: formData.get("notes") as string,
      tags: tags,
    }

    try {
      const response = await fetch("/api/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) {
        throw new Error("Failed to create client")
      }

      toast({
        title: "Success",
        description: "Client created successfully",
      })

      // Reset form
      e.currentTarget.reset()
      setServices([])
      setTags([])
      setSocialProfiles([])

      onClientAdded?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addService = (service: string) => {
    if (!services.includes(service)) {
      setServices([...services, service])
    }
  }

  const removeService = (service: string) => {
    setServices(services.filter((s) => s !== service))
  }

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const addSocialProfile = () => {
    if (newSocial.platform && newSocial.url) {
      setSocialProfiles([...socialProfiles, newSocial])
      setNewSocial({ platform: "", url: "" })
    }
  }

  const removeSocialProfile = (index: number) => {
    setSocialProfiles(socialProfiles.filter((_, i) => i !== index))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Client</CardTitle>
        <CardDescription>Fill in the client details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" name="companyName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input id="street" name="street" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" name="postalCode" />
              </div>
            </div>
          </div>

          {/* Point of Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Point of Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pocName">Name</Label>
                <Input id="pocName" name="pocName" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pocRole">Role</Label>
                <Input id="pocRole" name="pocRole" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pocPhone">Phone</Label>
                <Input id="pocPhone" name="pocPhone" type="tel" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pocEmail">Email</Label>
                <Input id="pocEmail" name="pocEmail" type="email" />
              </div>
            </div>
          </div>

          {/* Website */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Website</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">URL</Label>
                <Input id="websiteUrl" name="websiteUrl" type="url" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stack">Tech Stack (comma separated)</Label>
                <Input id="stack" name="stack" placeholder="React, Node.js, MongoDB" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domainProvider">Domain Provider</Label>
                <Input id="domainProvider" name="domainProvider" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostingProvider">Hosting Provider</Label>
                <Input id="hostingProvider" name="hostingProvider" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteStatus">Website Status</Label>
                <Select name="websiteStatus">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailAddress">Mail Address</Label>
                <Input id="mailAddress" name="mailAddress" type="email" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {services.map((service) => (
                <Badge key={service} variant="secondary" className="flex items-center gap-1">
                  {service}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeService(service)} />
                </Badge>
              ))}
            </div>
            <Select onValueChange={addService}>
              <SelectTrigger>
                <SelectValue placeholder="Add service" />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((service) => (
                  <SelectItem key={service} value={service} disabled={services.includes(service)}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Social Profiles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Profiles</h3>
            <div className="space-y-2">
              {socialProfiles.map((profile, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <span className="font-medium">{profile.platform}:</span>
                  <span className="flex-1">{profile.url}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSocialProfile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Platform"
                value={newSocial.platform}
                onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
              />
              <Input
                placeholder="URL"
                value={newSocial.url}
                onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
              />
              <Button type="button" onClick={addSocialProfile}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Billing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Billing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingModel">Billing Model</Label>
                <Select name="billingModel">
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="retainer">Retainer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue="INR" />
              </div>
            </div>
          </div>

          {/* Status and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={4} />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Client"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

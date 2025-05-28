"use client"

import {BillingAnalytics} from "@/components/billing-analytics"
import { BillingForm } from "@/components/billing-form"
import { BillingTable } from "@/components/billing-table"
import { ClientForm } from "@/components/client-form"
import { ClientsTable } from "@/components/clients-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { useState } from "react"

export default function Home() {
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const handleClientAdded = () => {
        setRefreshTrigger((prev) => prev + 1)
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Client Management System</h1>
                <p className="text-muted-foreground">
                    Manage your clients, track their information, and handle billing details.
                </p>
            </div>

            <Tabs defaultValue="clients" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="clients">All Clients</TabsTrigger>
                    <TabsTrigger value="add-client">Add Client</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="create-bill">Create Bill</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="clients" className="mt-6">
                    <ClientsTable refreshTrigger={refreshTrigger} />
                </TabsContent>

                <TabsContent value="add-client" className="mt-6">
                    <ClientForm onClientAdded={handleClientAdded} />
                </TabsContent>

                <TabsContent value="billing" className="mt-6">
                    <BillingTable refreshTrigger={refreshTrigger} />
                </TabsContent>

                <TabsContent value="create-bill" className="mt-6">
                    <BillingForm onBillingCreated={handleClientAdded} />
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    <BillingAnalytics />
                </TabsContent>
            </Tabs>

            <Toaster />
        </div>
    )
}

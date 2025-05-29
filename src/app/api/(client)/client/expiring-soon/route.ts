import connectDB from "@/lib/db";
import { Client } from "@/lib/models";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await connectDB();

        // Get current date
        const now = new Date();
        // Get date 30 days from now
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        // Find clients with domain expiry within the next 30 days
        const expiringClients = await Client.find({
            'website.domainExpiry': {
                $exists: true,
                $ne: null,
                $gte: now,
                $lte: thirtyDaysFromNow
            }
        }).select('_id email website.url website.domainExpiry');

        // Format the response according to the ResponseClient interface
        const formattedClients = expiringClients.map((client) => ({
            id: client._id.toString(),
            email: client.email,
            domain: client.website?.url || '',
            expiryDate: client.website?.domainExpiry ? client.website.domainExpiry.toISOString() : '',
        }));

        return NextResponse.json(formattedClients);
    } catch (error) {
        console.error("Error fetching expiring domains:", error);
        return NextResponse.json(
            { error: "Failed to fetch expiring domains" },
            { status: 500 }
        );
    }
}

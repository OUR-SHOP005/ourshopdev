import { connectDB } from '@/lib/db'
import { ReminderLog } from '@/lib/models'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Send email notification
export async function POST(request: Request) {
    try {
        await connectDB()

        const {
            to,
            subject,
            html,
            text,
            from = process.env.EMAIL_FROM || 'Project Manager <onboarding@resend.dev>',
            clientId,
            reminderType = 'GENERAL',
        } = await request.json()

        // Validate required fields
        if (!to || (!html && !text) || !subject) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: to, subject, and html or text content' },
                { status: 400 }
            )
        }

        // Send email with Resend
        const { data, error } = await resend.emails.send({
            from,
            to,
            subject,
            html: html || undefined,
            text: text || undefined,
        })

        if (error) {
            throw new Error(`Failed to send email: ${error.message}`)
        }

        // Log the email notification if clientId is provided
        if (clientId) {
            const reminderLog = new ReminderLog({
                clientId: new mongoose.Types.ObjectId(clientId),
                email: to,
                reminderType,
                message: subject,
                status: 'SENT',
                sentAt: new Date()
            })

            await reminderLog.save()
        }

        return NextResponse.json({
            success: true,
            data: {
                messageId: data?.id,
                to,
                subject
            }
        })
    } catch (error: any) {
        console.error('Email sending error:', error)

        // Log failure if clientId is provided
        const { clientId, to, reminderType, subject } = await request.json().catch(() => ({}))

        if (clientId && to) {
            try {
                const failedLog = new ReminderLog({
                    clientId: new mongoose.Types.ObjectId(clientId),
                    email: to,
                    reminderType: reminderType || 'GENERAL',
                    message: subject || 'Email notification',
                    status: 'FAILED',
                    error: error.message || 'Unknown error',
                    sentAt: new Date()
                })

                await failedLog.save()
            } catch (logError) {
                console.error('Failed to log email error:', logError)
            }
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send email' },
            { status: 500 }
        )
    }
} 
/**
 * Utility for generating AI-powered email content
 */

/**
 * Generate personalized email content using AI
 * @param template The template type to generate
 * @param data The data to personalize the email with
 * @returns The generated email content
 */
export async function generateEmailContent(template: EmailTemplate, data: any): Promise<EmailContent> {
    try {
        // Create the prompt based on template type
        const prompt = createPrompt(template, data)

        // Make request to our AI API
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY || '',
            },
            body: JSON.stringify({
                prompt,
                temperature: 0.7,
            }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to generate email content')
        }

        const result = await response.json()

        // Extract the subject line and body from the AI response
        const text = result.data.text
        const [subject, ...bodyParts] = text.split('\n\n')

        return {
            subject: subject.replace('Subject: ', ''),
            body: bodyParts.join('\n\n'),
        }
    } catch (error) {
        console.error('Error generating email content:', error)
        // Return fallback content
        return getFallbackContent(template, data)
    }
}

// Email template types
export type EmailTemplate =
    | 'PAYMENT_REMINDER'
    | 'DOMAIN_EXPIRY'
    | 'WELCOME'
    | 'INVOICE'

// Email content structure
export interface EmailContent {
    subject: string
    body: string
}

// Create the prompt for the AI based on template type and data
function createPrompt(template: EmailTemplate, data: any): string {
    switch (template) {
        case 'PAYMENT_REMINDER':
            return `
Generate a professional payment reminder email to a client.

Client details:
- Name: ${data.clientName}
- Invoice Number: ${data.invoiceNumber}
- Amount Due: ${data.amount} ${data.currency}
- Due Date: ${data.dueDate}

The tone should be polite but firm. Include the following elements:
1. A clear subject line indicating this is a payment reminder
2. Greeting with the client's name
3. Brief reminder about the invoice
4. The amount due and the due date
5. Payment options if provided
6. A call to action
7. Polite closing

Format your response with a subject line followed by the email body.
      `.trim()

        case 'DOMAIN_EXPIRY':
            return `
Generate a domain expiry reminder email to a client.

Client details:
- Name: ${data.clientName}
- Company: ${data.companyName || 'your company'}
- Domain: ${data.domain}
- Expiry Date: ${data.expiryDate}
- Renewal Fee: ${data.renewalFee || 'the renewal fee'}

The email should:
1. Have a clear subject line about domain expiry
2. Include a greeting with the client's name
3. Remind them about their domain expiring soon
4. Explain the importance of renewing to avoid service disruption
5. Mention the renewal fee if provided
6. Include a clear call to action for renewal
7. Have a professional closing

Format your response with a subject line followed by the email body.
      `.trim()

        case 'WELCOME':
            return `
Generate a welcome email for a new client.

Client details:
- Name: ${data.clientName}
- Company: ${data.companyName || 'your company'}
- Services: ${data.services?.join(', ') || 'our services'}

The email should:
1. Have a warm welcoming subject line
2. Include a personalized greeting
3. Express appreciation for choosing our services
4. Briefly outline next steps or what to expect
5. Introduce key contact person(s)
6. Invite questions or feedback
7. Have a friendly closing

Format your response with a subject line followed by the email body.
      `.trim()

        case 'INVOICE':
            return `
Generate an invoice notification email.

Client details:
- Name: ${data.clientName}
- Company: ${data.companyName || 'your company'}
- Invoice Number: ${data.invoiceNumber}
- Amount: ${data.amount} ${data.currency}
- Due Date: ${data.dueDate}
- Services: ${data.services?.join(', ') || 'our services'}

The email should:
1. Have a clear subject line about the new invoice
2. Include a professional greeting
3. Notify about the new invoice and amount due
4. Summarize the services provided
5. Mention the payment due date
6. Provide payment instructions if available
7. Have a professional closing

Format your response with a subject line followed by the email body.
      `.trim()

        default:
            return `Generate a professional email notification. Include a subject line and body.`
    }
}

// Fallback content in case AI generation fails
function getFallbackContent(template: EmailTemplate, data: any): EmailContent {
    switch (template) {
        case 'PAYMENT_REMINDER':
            return {
                subject: `Payment Reminder: Invoice #${data.invoiceNumber}`,
                body: `Dear ${data.clientName},\n\nThis is a friendly reminder that invoice #${data.invoiceNumber} for ${data.amount} ${data.currency} is due on ${data.dueDate}.\n\nPlease process the payment at your earliest convenience.\n\nBest regards,\nThe Billing Team`
            }

        case 'DOMAIN_EXPIRY':
            return {
                subject: `Domain Expiry Reminder: ${data.domain}`,
                body: `Dear ${data.clientName},\n\nYour domain ${data.domain} is set to expire on ${data.expiryDate}. Please renew it before the expiration date to avoid service disruption.\n\nBest regards,\nThe Support Team`
            }

        case 'WELCOME':
            return {
                subject: `Welcome to Our Services!`,
                body: `Dear ${data.clientName},\n\nWelcome aboard! We're thrilled to have you as our client and look forward to working with you.\n\nBest regards,\nThe Team`
            }

        case 'INVOICE':
            return {
                subject: `New Invoice #${data.invoiceNumber}`,
                body: `Dear ${data.clientName},\n\nA new invoice #${data.invoiceNumber} for ${data.amount} ${data.currency} has been generated for your account. The payment is due on ${data.dueDate}.\n\nBest regards,\nThe Billing Team`
            }

        default:
            return {
                subject: 'Notification',
                body: 'This is an automated notification from our system.'
            }
    }
} 
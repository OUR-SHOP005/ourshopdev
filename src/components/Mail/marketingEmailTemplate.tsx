interface MarketingEmailProps {
  greeting: string;
  mainContent: string;
  cta: string;
  ctaUrl: string;
  ctaText: string;
  closing: string;
  subscriberId: string;
}

export default function marketingEmailTemplate({
  greeting,
  mainContent,
  cta,
  ctaUrl,
  ctaText,
  closing,
  subscriberId,
}: MarketingEmailProps) {
  // Convert mainContent paragraphs to HTML
  const formattedContent = mainContent
    .split("\n")
    .filter((para) => para.trim() !== "")
    .map((para) => `<p style="margin: 12px 0; line-height: 1.5;">${para}</p>`)
    .join("");

  // Generate unsubscribe URL
  const unsubscribeUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || ""
  }/unsubscribe/${subscriberId}`;

  return `
    <!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
    <head>
      <meta charset="utf-8">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="x-ua-compatible" content="ie=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
      <title>Marketing Update</title>
      <style>
        @media only screen and (max-width: 600px) {
          .wrapper {
            padding: 20px !important;
          }
          .content {
            padding: 20px !important;
          }
          .cta-button {
            display: block !important;
            width: 100% !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; width: 100%; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #f5f5f5;">
      <div style="display: none; line-height: 0; font-size: 0;">Latest updates from our site</div>
      <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table class="content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <!-- Header -->
              <tr>
                <td style="padding: 30px 30px 20px; background-color: #4f46e5; text-align: center;">
                  <h1 style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; color: #ffffff; font-size: 24px; font-weight: bold;">
                    New Update
                  </h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 12px 0 20px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.5;">
                    ${greeting}
                  </p>
                  
                  <div style="margin: 24px 0; font-family: 'Helvetica Neue', Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.5;">
                    ${formattedContent}
                  </div>
                  
                  <p style="margin: 20px 0 30px; font-family: 'Helvetica Neue', Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.5;">
                    ${cta}
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${ctaUrl}" class="cta-button" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; text-align: center; padding: 12px 30px; border-radius: 4px;">
                      ${ctaText}
                    </a>
                  </div>
                  
                  <p style="margin: 30px 0 0; font-family: 'Helvetica Neue', Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.5;">
                    ${closing}
                  </p>
                  
                  <p style="margin: 16px 0 0; font-family: 'Helvetica Neue', Arial, sans-serif; color: #333333; font-size: 16px; line-height: 1.5;">
                    Best regards,<br>
                    The Team
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 20px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e5e5e5;">
                  <p style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; color: #6c757d; font-size: 14px;">
                    You're receiving this email because you opted in to marketing communications.
                  </p>
                  <p style="margin: 12px 0 0; font-family: 'Helvetica Neue', Arial, sans-serif; color: #6c757d; font-size: 14px;">
                    <a href="${unsubscribeUrl}" style="color: #4f46e5; text-decoration: underline;">Unsubscribe</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

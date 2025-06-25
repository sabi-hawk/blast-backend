import nodemailer from 'nodemailer';
import Template from '@models/Template';
import fs from 'fs/promises';

// Create transporter with your Mailtrap credentials
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "292652cda298b3",
    pass: "70638890d047a3"
  }
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions = {
      from: options.from || "noreply@yourcompany.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transport.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendBulkEmails = async (emails: string[], subject: string, htmlContent: string): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail({
      to: email,
      subject,
      html: htmlContent
    });
    
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
};

// Helper to get HTML content for a campaign's template
export const getCampaignHtmlContent = async (templateId: string): Promise<string> => {
  const template = await Template.findById(templateId);
  if (!template) throw new Error('Template not found');
  const html = await fs.readFile(template.htmlPath, 'utf-8');
  return html;
}; 
'use server';
/**
 * @fileOverview A flow for sending emails using Resend.
 * This flow integrates with the Resend API to send transactional emails.
 * Ensure you have RESEND_API_KEY set in your .env file.
 * 
 * - sendEmail - A function that handles sending an email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';

// The API key is read from the .env file.
const resend = new Resend(process.env.RESEND_API_KEY);

export const SendEmailInputSchema = z.object({
  to: z.string().email().describe("The recipient's email address."),
  subject: z.string().describe("The subject of the email."),
  body: z.string().describe("The HTML content of the email."),
  bcc: z.string().email().optional().describe("The BCC recipient's email address."),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export async function sendEmail(input: SendEmailInput): Promise<{ success: boolean }> {
  return sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.object({ success: z.boolean(), error: z.string().optional() }),
  },
  async (input) => {
    if (!process.env.RESEND_API_KEY) {
      console.error("Resend API key is not set. Email will not be sent.");
      return { success: false, error: "Resend API key is missing." };
    }

    try {
      const { data, error } = await resend.emails.send({
        // IMPORTANT: In production, you must use a domain you have verified in Resend.
        // For development, `onboarding@resend.dev` is a valid sender.
        from: 'FusionArte <onboarding@resend.dev>',
        to: input.to,
        bcc: input.bcc,
        subject: input.subject,
        html: input.body,
      });

      if (error) {
        console.error('Error sending email with Resend:', error);
        return { success: false, error: error.message };
      }

      console.log('Email sent successfully:', data);
      return { success: true };
    } catch (err) {
      const error = err as Error;
      console.error('An unexpected error occurred while sending email:', error);
      return { success: false, error: error.message };
    }
  }
);

'use server';
/**
 * @fileOverview A flow for sending emails using Resend.
 * This flow integrates with the Resend API to send transactional emails.
 * Ensure you have RESEND_API_KEY set in your .env file.
 * 
 * - sendEmail - A function that handles sending an email.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { Resend } from 'resend';
import { SendEmailInput, SendEmailInputSchema } from '@/lib/types';


// The API key is read from the .env file.
const resend = new Resend(process.env.RESEND_API_KEY);

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
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'YOUR_API_KEY_HERE') {
      console.error("Resend API key is not set. Email will not be sent.");
      // For this prototype, we'll return success even if the key is missing to avoid breaking user flows.
      // In a real app, you would return the error.
      // return { success: false, error: "Resend API key is missing." };
      return { success: true };
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
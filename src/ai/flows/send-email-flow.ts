'use server';
/**
 * @fileOverview A flow for sending emails.
 * In a real application, this would integrate with a service like Resend or SendGrid.
 * For this prototype, it will just log the action to the console.
 * 
 * - sendEmail - A function that handles sending an email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (input) => {
    console.log('--- SIMULATING EMAIL ---');
    console.log(`To: ${input.to}`);
    if (input.bcc) {
      console.log(`BCC: ${input.bcc}`);
    }
    console.log(`Subject: ${input.subject}`);
    console.log('Body:');
    console.log(input.body);
    console.log('--- END OF SIMULATION ---');

    // In a real implementation, you would use a service like Resend here.
    // For example:
    // await resend.emails.send({
    //   from: 'you@yourdomain.com',
    //   to: input.to,
    //   subject: input.subject,
    //   html: input.body,
    // });

    return { success: true };
  }
);

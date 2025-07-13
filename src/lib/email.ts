
'use server';

import { Resend } from 'resend';
import { z } from 'zod';

if (!process.env.RESEND_API_KEY) {
  console.log('RESEND_API_KEY is not set. Email sending will be disabled.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const SendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  html: z.string(),
  from: z.string().email().optional().default('FusionArte <no-reply@fusionarte.com>'),
});

type SendEmailInput = z.infer<typeof SendEmailSchema>;

export async function sendEmail(input: SendEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Skipping email send because RESEND_API_KEY is not configured.');
    // Return a success-like object to avoid breaking the UI in development
    return { success: true, data: { id: 'dev-mode-skipped-email' } };
  }

  try {
    const validatedInput = SendEmailSchema.parse(input);

    const { data, error } = await resend.emails.send({
      from: validatedInput.from,
      to: validatedInput.to,
      subject: validatedInput.subject,
      html: validatedInput.html,
    });

    if (error) {
      console.error('Resend Error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
        console.error('Invalid email input:', error.flatten());
        return { success: false, error: 'Invalid input.' };
    }
    console.error('Failed to send email:', error);
    return { success: false, error: 'Failed to send email.' };
  }
}

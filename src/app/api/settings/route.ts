
'use server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import type { HeroSlide, ScheduleImage } from '@/lib/types';

// Define a schema for validation that matches the Settings model in Prisma
const settingsSchema = z.object({
  academyName: z.string().min(1),
  contactEmail: z.string().email(),
  phone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  address: z.string().optional(),
  welcomeMessage: z.string().optional(),
  enableNewSignups: z.boolean(),
  maintenanceMode: z.boolean(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  instagramUrl: z.string().url().or(z.literal('')).optional(),
  facebookUrl: z.string().url().or(z.literal('')).optional(),
  tiktokUrl: z.string().url().or(z.literal('')).optional(),
  openingHours: z.string().optional(),
  registrationEmailMessage: z.string().optional(),
  membershipEmailMessage: z.string().optional(),
  heroSlides: z.any().optional(),
  scheduleImages: z.any().optional(),
  aboutUsTitle: z.string().optional(),
  aboutUsStory: z.string().optional(),
  aboutUsMission: z.string().optional(),
  aboutUsVision: z.string().optional(),
  aboutUsValues: z.string().optional(),
  aboutUsTeamTitle: z.string().optional(),
  aboutUsTeamDescription: z.string().optional(),
});

// There will only ever be one row in the Settings table with a fixed ID.
const SETTINGS_ID = 'singleton';

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: SETTINGS_ID },
    });

    // If no settings exist, create with default values
    if (!settings) {
        settings = await prisma.settings.create({
            data: {
                id: SETTINGS_ID,
                academyName: 'FusionArte',
                contactEmail: 'contact@example.com',
                enableNewSignups: true,
                maintenanceMode: false,
                heroSlides: [],
                scheduleImages: [],
            }
        })
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const json = await request.json();
    const validatedData = settingsSchema.parse(json);
    
    const settings = await prisma.settings.upsert({
      where: { id: SETTINGS_ID },
      update: validatedData,
      create: { id: SETTINGS_ID, ...validatedData },
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

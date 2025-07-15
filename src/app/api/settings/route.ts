
'use server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const heroSlideSchema = z.object({
  id: z.string().optional(),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().optional(),
  heroDescription: z.string().optional(),
  heroButtonText: z.string().min(1),
  heroButtonLink: z.string(),
  heroImageUrl: z.string().optional(),
});

const scheduleImageSchema = z.object({
    id: z.string().optional(),
    url: z.string().min(1),
    alt: z.string().optional(),
});

const settingsSchema = z.object({
  academyName: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  phone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  address: z.string().optional(),
  welcomeMessage: z.string().optional(),
  enableNewSignups: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  instagramUrl: z.string().url().or(z.literal('')).optional(),
  facebookUrl: z.string().url().or(z.literal('')).optional(),
  tiktokUrl: z.string().url().or(z.literal('')).optional(),
  openingHours: z.string().optional(),
  registrationEmailMessage: z.string().optional(),
  membershipEmailMessage: z.string().optional(),
  heroSlides: z.array(heroSlideSchema).optional(),
  scheduleImages: z.array(scheduleImageSchema).optional(),
  aboutUsTitle: z.string().optional(),
  aboutUsStory: z.string().optional(),
  aboutUsMission: z.string().optional(),
  aboutUsVision: z.string().optional(),
  aboutUsValues: z.string().optional(),
  aboutUsTeamTitle: z.string().optional(),
  aboutUsTeamDescription: z.string().optional(),
}).partial();

const SETTINGS_ID = 'singleton';

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: SETTINGS_ID },
    });

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
      create: { id: SETTINGS_ID, ...validatedData, academyName: 'FusionArte', contactEmail: 'change@me.com' },
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

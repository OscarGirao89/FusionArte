
'use server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const heroSlideSchema = z.object({
  id: z.string().optional(),
  heroTitle: z.string().min(1, "El título es obligatorio."),
  heroSubtitle: z.string().optional(),
  heroDescription: z.string().optional(),
  heroButtonText: z.string().min(1, "El texto del botón es obligatorio."),
  heroButtonLink: z.string().url("Debe ser una URL válida.").or(z.literal('')),
  heroImageUrl: z.string().optional(),
});

const scheduleImageSchema = z.object({
    id: z.string().optional(),
    url: z.string().min(1, "La URL de la imagen no puede estar vacía."),
    alt: z.string().optional(),
});

const settingsSchema = z.object({
  academyName: z.string().min(1, "El nombre de la academia es obligatorio.").optional(),
  contactEmail: z.string().email("Introduce un email válido.").optional(),
  phone: z.string().optional(),
  whatsappPhone: z.string().optional(),
  address: z.string().optional(),
  welcomeMessage: z.string().optional(),
  enableNewSignups: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  instagramUrl: z.string().url("URL de Instagram inválida.").or(z.literal('')).optional(),
  facebookUrl: z.string().url("URL de Facebook inválida.").or(z.literal('')).optional(),
  tiktokUrl: z.string().url("URL de TikTok inválida.").or(z.literal('')).optional(),
  openingHours: z.string().optional(),
  
  registrationEmailMessage: z.string().optional(),
  membershipEmailMessage: z.string().optional(),

  aboutUsTitle: z.string().min(1, "El título es obligatorio.").optional(),
  aboutUsStory: z.string().min(1, "La historia es obligatoria.").optional(),
  aboutUsMission: z.string().min(1, "La misión es obligatoria.").optional(),
  aboutUsVision: z.string().min(1, "La visión es obligatoria.").optional(),
  aboutUsValues: z.string().min(1, "Los valores son obligatorios.").optional(),
  aboutUsTeamTitle: z.string().min(1, "El título del equipo es obligatorio.").optional(),
  aboutUsTeamDescription: z.string().min(1, "La descripción del equipo es obligatoria.").optional(),

  heroSlides: z.array(heroSlideSchema).min(1, "Debe haber al menos una diapositiva.").optional(),
  scheduleImages: z.array(scheduleImageSchema).optional(),
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
                contactEmail: 'contacto@fusionarte.com',
                phone: "+34 123 456 789",
                whatsappPhone: "+34123456789",
                address: "Calle Falsa 123, Ciudad Danza, 45678",
                enableNewSignups: true,
                maintenanceMode: false,
                instagramUrl: "https://www.instagram.com/fusionarte",
                facebookUrl: "https://www.facebook.com/fusionarte",
                tiktokUrl: "https://www.tiktok.com/@fusionarte",
                aboutUsTitle: "Nuestra Historia",
                aboutUsStory: "FusionArte nació de un sueño compartido...",
                aboutUsMission: "Ofrecer una enseñanza de la más alta calidad...",
                aboutUsVision: "Ser un referente en la enseñanza de la danza...",
                aboutUsValues: "Pasión, Respeto, Comunidad...",
                aboutUsTeamTitle: "El Equipo Fundador",
                aboutUsTeamDescription: "Las mentes y corazones detrás de FusionArte.",
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
      create: {
        id: SETTINGS_ID,
        // Start with all required defaults to satisfy Prisma's create input type
        academyName: 'FusionArte',
        contactEmail: 'change@me.com',
        enableNewSignups: true,
        maintenanceMode: false,
        aboutUsTitle: '',
        aboutUsStory: '',
        aboutUsMission: '',
        aboutUsVision: '',
        aboutUsValues: '',
        aboutUsTeamTitle: '',
        aboutUsTeamDescription: '',
        heroSlides: [],
        scheduleImages: [],
        // Then, apply any validated data that was actually sent in the request
        ...validatedData,
      },
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

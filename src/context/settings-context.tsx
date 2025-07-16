
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { AcademySettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export interface SettingsContextType {
  settings: AcademySettings | null;
  updateSettings: (newSettings: Partial<AcademySettings>) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const initialSettings: AcademySettings = {
  academyName: "FusionArte",
  contactEmail: "contacto@fusionarte.com",
  phone: "+34 123 456 789",
  whatsappPhone: "+34123456789",
  address: "Calle Falsa 123, Ciudad Danza, 45678",
  welcomeMessage: "¡Bienvenido a FusionArte! El lugar donde la pasión y el arte se encuentran.",
  enableNewSignups: true,
  maintenanceMode: false,
  logoUrl: "",
  faviconUrl: "/favicon.ico",
  instagramUrl: "https://www.instagram.com/fusionarte",
  facebookUrl: "https://www.facebook.com/fusionarte",
  tiktokUrl: "https://www.tiktok.com/@fusionarte",
  openingHours: "Lunes a Viernes: 10:00 - 22:00\nSábados: 10:00 - 14:00",
  registrationEmailMessage: "¡Te damos la bienvenida a {{academyName}}! Estamos muy contentos de tenerte en nuestra comunidad. Explora nuestras clases y encuentra tu ritmo.",
  membershipEmailMessage: "Gracias por unirte a nuestra comunidad. Estamos emocionados de verte en la pista de baile.",
  aboutUsTitle: "Nuestra Historia",
  aboutUsStory: "FusionArte nació de un sueño compartido: crear un espacio donde la pasión por el baile pudiera florecer sin límites, uniendo a personas de todos los niveles en una comunidad vibrante y acogedora.",
  aboutUsMission: "Ofrecer una enseñanza de la más alta calidad en un ambiente inclusivo y motivador, fomentando el crecimiento artístico y personal de cada alumno.",
  aboutUsVision: "Ser un referente en la enseñanza de la danza, reconocidos por nuestra excelencia, innovación y la comunidad que hemos construido.",
  aboutUsValues: "Pasión, Respeto, Comunidad, Excelencia y Alegría son los pilares que guían cada uno de nuestros pasos.",
  aboutUsTeamTitle: "El Equipo Fundador",
  aboutUsTeamDescription: "Las mentes y corazones detrás de FusionArte.",
  heroSlides: [
    {
      id: "slide1",
      heroTitle: "Urban Dance Masterclass",
      heroSubtitle: "Evento Especial: 24-28 Julio",
      heroDescription: "Eleva tu nivel con nuestros instructores de clase mundial en un evento intensivo de 5 días. Plazas limitadas.",
      heroButtonText: "Inscríbete Ahora",
      heroButtonLink: "/schedule",
      heroImageUrl: "https://placehold.co/800x1200.png",
    },
     {
      id: "slide2",
      heroTitle: "Nuevas Clases de Tango",
      heroSubtitle: "A partir de Septiembre",
      heroDescription: "Descubre la pasión y el abrazo del tango argentino. Clases para todos los niveles, ¡no se necesita pareja!",
      heroButtonText: "Ver Horarios",
      heroButtonLink: "/schedule",
      heroImageUrl: "https://placehold.co/800x1200.png",
    }
  ],
  scheduleImages: [],
};


export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AcademySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            if (response.ok) {
                const data = await response.json();
                // Merge with initial settings to ensure all keys are present
                setSettings({ ...initialSettings, ...data });
            } else {
                setSettings(initialSettings);
            }
        } catch (error) {
            console.error("Could not fetch settings, using defaults.", error);
            setSettings(initialSettings);
        } finally {
            setIsLoading(false);
        }
    };
    fetchSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AcademySettings>) => {
    try {
        const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSettings),
        });
        if (response.ok) {
            const data = await response.json();
            // Correctly merge the partial update with the previous state
            setSettings(prev => ({...(prev ?? initialSettings), ...data}));
            // Reload the page to ensure all components get the new settings
            window.location.reload(); 
        } else {
            console.error("Failed to save settings to the server.");
        }
    } catch (error) {
         console.error("Error saving settings:", error);
    }
  }, []);

  if (isLoading || !settings) {
    return <div className="flex h-screen w-screen items-center justify-center"><Skeleton className="h-20 w-20 rounded-full" /></div>
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};


'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { AcademySettings } from '@/lib/types';

export interface SettingsContextType {
  settings: AcademySettings;
  updateSettings: (newSettings: Partial<AcademySettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const initialSettings: AcademySettings = {
  academyName: "FusionArte",
  contactEmail: "contacto@fusionarte.com",
  phone: "+34 123 456 789",
  address: "Calle Falsa 123, Ciudad Danza, 45678",
  welcomeMessage: "¡Bienvenido a FusionArte! El lugar donde la pasión y el arte se encuentran.",
  enableNewSignups: true,
  maintenanceMode: false,
  logoUrl: "",
  instagramUrl: "https://www.instagram.com",
  facebookUrl: "https://www.facebook.com",
  tiktokUrl: "https://www.tiktok.com",
  openingHours: "Lunes a Viernes: 10:00 - 22:00\nSábados: 10:00 - 14:00",
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
  const [settings, setSettings] = useState<AcademySettings>(initialSettings);
  
  // In a real app, this would likely fetch from a DB and persist changes.
  // We'll use localStorage for this prototype for persistence across reloads.
  React.useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('academySettings');
      if (storedSettings) {
        // Merge stored settings with defaults to handle new properties being added
        setSettings({ ...initialSettings, ...JSON.parse(storedSettings) });
      }
    } catch (error) {
      console.error("Could not access localStorage for settings", error);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AcademySettings>) => {
    setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        try {
            localStorage.setItem('academySettings', JSON.stringify(updated));
        } catch (error) {
            console.error("Could not access localStorage for settings", error);
        }
        return updated;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
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

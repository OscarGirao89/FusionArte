
'use client';
import { useSettings } from "@/context/settings-context";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { IdentitySettingsForm } from "@/components/settings/identity-settings-form";
import { GeneralSettingsForm } from "@/components/settings/general-settings-form";
import { ContactSettingsForm } from "@/components/settings/contact-settings-form";
import { EmailTemplatesForm } from "@/components/settings/email-templates-form";
import { AppSettingsForm } from "@/components/settings/app-settings-form";
import { AboutUsSettingsForm } from "@/components/settings/about-us-form";
import { HeroSlidesForm } from "@/components/settings/hero-slides-form";
import { ScheduleImagesForm } from "@/components/settings/schedule-images-form";

export default function AdminSettingsPage() {
    const { settings, isLoading } = useSettings();
    
    if (isLoading || !settings) {
        return (
            <div className="p-4 md:p-8 space-y-8">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Configuración</h1>
      <div className="space-y-8">
        <IdentitySettingsForm settings={settings} />
        <GeneralSettingsForm settings={settings} />
        <ContactSettingsForm settings={settings} />
        <EmailTemplatesForm settings={settings} />
        <AppSettingsForm settings={settings} />
        <AboutUsSettingsForm settings={settings} />
        <HeroSlidesForm settings={settings} />
        <ScheduleImagesForm settings={settings} />
      </div>
    </div>
  );
}

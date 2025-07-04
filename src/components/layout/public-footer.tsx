
'use client';

import Link from 'next/link';
import { LogoIcon } from '@/components/icons/logo-icon';
import { useSettings } from '@/context/settings-context';
import { Facebook, Instagram } from 'lucide-react';
import { TikTokIcon } from '@/components/icons/tiktok-icon';
import Image from 'next/image';

export function PublicFooter() {
  const { settings } = useSettings();

  return (
    <footer className="bg-muted py-8 border-t">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <div className="flex justify-center items-center gap-2 mb-4">
            {settings.logoUrl ? (
                <Image src={settings.logoUrl} alt={settings.academyName} width={32} height={32} className="h-8 w-auto" />
            ) : (
                <LogoIcon className="h-8 w-8 text-primary" />
            )}
            <span className="font-bold text-lg font-headline text-foreground">{settings.academyName}</span>
        </div>
        <div className="flex justify-center gap-4 my-4">
            {settings.instagramUrl && <Link href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>}
            {settings.facebookUrl && <Link href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"><Facebook className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>}
            {settings.tiktokUrl && <Link href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer"><TikTokIcon className="h-6 w-6 text-muted-foreground hover:text-primary" /></Link>}
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} {settings.academyName}. Todos los derechos reservados.</p>
        <p className="text-xs mt-2">{settings.address}</p>
      </div>
    </footer>
  );
}

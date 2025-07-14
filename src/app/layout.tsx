
'use client';
import './globals.css';
import { MainNav } from '@/components/layout/main-nav';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/auth-context';
import { PublicFooter } from '@/components/layout/public-footer';
import { SettingsProvider, useSettings } from '@/context/settings-context';
import { AttendanceProvider } from '@/context/attendance-context';
import { TaskAlerts } from '@/components/shared/task-alerts';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  
  return (
     <>
        <head>
          <title>{settings?.academyName || 'DanceFlow'}</title>
          <link rel="icon" href={settings?.faviconUrl || "/favicon.ico"} type="image/x-icon" />
          <meta name="description" content={settings?.welcomeMessage || "Sistema de gestión integral para escuela de baile."} />
          <meta name="theme-color" content="#673AB7" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&display=swap" rel="stylesheet" />
        </head>
        <div className="flex flex-col min-h-screen bg-background">
          <MainNav />
          <main className="flex-1 flex flex-col">{children}</main>
          <PublicFooter />
          <Toaster />
          <TaskAlerts />
        </div>
     </>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-body antialiased">
        <SettingsProvider>
          <AttendanceProvider>
            <AuthProvider>
              <AppLayout>{children}</AppLayout>
            </AuthProvider>
          </AttendanceProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

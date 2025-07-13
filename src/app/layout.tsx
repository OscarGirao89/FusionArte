
'use client';
import './globals.css';
import { MainNav } from '@/components/layout/main-nav';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from '@/context/auth-context';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { SettingsProvider } from '@/context/settings-context';
import { AttendanceProvider } from '@/context/attendance-context';
import { TaskAlerts } from '@/components/shared/task-alerts';

function AppLayout({ children }: { children: React.ReactNode }) {
  // The MainNav will now handle visibility of auth-related components internally.
  // This ensures the main structure is always present.
  return (
     <div className="flex flex-col min-h-screen bg-background">
        <MainNav />
        <main className="flex-1 flex flex-col">{children}</main>
        <PublicFooter />
        <Toaster />
        <TaskAlerts />
      </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&display=swap" rel="stylesheet" />
        <title>FusionArte</title>
        <meta name="description" content="Sistema de gestión integral para la escuela de baile FusionArte." />
        <meta name="theme-color" content="#6d28d9" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
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

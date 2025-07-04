
'use client';
import './globals.css';
import { MainNav } from '@/components/layout/main-nav';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from '@/context/auth-context';
import { usePathname } from 'next/navigation';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  const isLoginPage = pathname === '/login';
  
  // If it's the login page, just render children (and Toaster)
  if (isLoginPage) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-1">{children}</main>
        <Toaster />
      </div>
    );
  }

  // If authenticated, render the app layout with the main horizontal nav
  if (isAuthenticated) {
    return (
       <div className="flex flex-col min-h-screen bg-background">
          <MainNav />
          <main className="flex-1">{children}</main>
          <Toaster />
        </div>
    );
  }
  
  // Otherwise, render the public layout
  return (
     <div className="flex flex-col min-h-screen bg-background">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
        <Toaster />
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
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

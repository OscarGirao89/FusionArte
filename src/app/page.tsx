
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { users } from '@/lib/data';
import { Award, Music, Users, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSettings } from '@/context/settings-context';

export default function HomePage() {
  const featuredTeachers = users.filter(u => (u.role === 'Profesor' || u.role === 'Socio') && u.isVisibleToStudents).slice(0, 3);
  const { settings } = useSettings();

  return (
    <div className="flex-1 bg-background">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-slate-50 dark:bg-slate-900" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="container mx-auto h-full px-4">
          <div className="relative grid md:grid-cols-2 items-center h-full" style={{ minHeight: 'calc(100vh - 80px)' }}>
            
            <div className="absolute top-1/2 left-0 w-3/4 h-[90%] -translate-y-1/2 bg-primary/10 rounded-full blur-3xl" 
                 style={{ clipPath: 'ellipse(60% 75% at 20% 50%)'}} />

            <div className="relative z-10 py-16 md:py-0">
              <p className="font-semibold text-primary uppercase tracking-widest">
                {settings.heroSubtitle}
              </p>
              <h1 className="mt-2 text-4xl sm:text-5xl lg:text-7xl font-extrabold font-sans text-gray-900 dark:text-white leading-tight">
                {settings.heroTitle}
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-lg">
                {settings.heroDescription}
              </p>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href={settings.heroButtonLink || '/'}>{settings.heroButtonText}</Link>
                </Button>
              </div>
            </div>

            <div className="relative h-full w-full hidden md:flex items-end justify-center">
              <div className="absolute bottom-0 right-0 w-[85%] h-[95%]">
                <Image
                    src={settings.heroImageUrl || "https://placehold.co/800x1200.png"}
                    alt="Bailarina de danza urbana"
                    layout="fill"
                    objectFit="contain"
                    objectPosition="bottom right"
                    data-ai-hint="dancer urban"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 right-[35%] z-0 hidden lg:block text-slate-300/70 dark:text-slate-700/70">
            <svg width="250" height="60" viewBox="0 0 250 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 30 C 31.25 15, 62.5 15, 93.75 30 S 156.25 45, 187.5 30 S 250 15, 250 15" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M0 40 C 31.25 25, 62.5 25, 93.75 40 S 156.25 55, 187.5 40 S 250 25, 250 25" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M0 50 C 31.25 35, 62.5 35, 93.75 50 S 156.25 65, 187.5 50 S 250 35, 250 35" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">¿Por Qué Elegir FusionArte?</h2>
            <p className="text-lg text-muted-foreground mt-2">Más que una escuela, somos una comunidad.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">Profesores Expertos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Aprende de instructores apasionados y reconocidos en su campo.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  <Music className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">Variedad de Estilos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Desde Salsa y Bachata hasta Hip Hop y Aeroyoga. ¡Encuentra tu ritmo!</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">Comunidad Vibrante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Únete a una familia de bailarines que comparten tu pasión y energía.</p>
              </CardContent>
            </Card>
             <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="mt-4 font-headline">Ambiente Acogedor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Un espacio seguro y divertido para aprender, crecer y expresarte.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Featured Teachers Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Nuestros Instructores</h2>
             <p className="text-lg text-muted-foreground mt-2">Conoce a algunos de los talentos que te guiarán.</p>
          </div>
           <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredTeachers.map(teacher => (
               <Card key={teacher.id} className="overflow-hidden text-center group">
                  <div className="relative h-64 w-full">
                    <Image
                      src={teacher.avatar}
                      alt={`Foto de ${teacher.name}`}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="portrait professional"
                    />
                  </div>
                  <CardContent className="p-6">
                      <h3 className="font-headline text-xl font-bold">{teacher.name}</h3>
                      <p className="text-sm text-primary font-semibold">{teacher.specialties?.join(', ')}</p>
                  </CardContent>
               </Card>
            ))}
          </div>
          <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline">
                  <Link href="/teachers">Conoce a Todo el Equipo</Link>
              </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
         <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">¿Listo/a para Dar el Primer Paso?</h2>
            <p className="text-lg mt-2 max-w-2xl mx-auto">
                Tu aventura en el mundo del baile está a solo un clic de distancia. ¡Te esperamos en la pista!
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link href="/memberships">Ver Planes y Membresías</Link>
            </Button>
         </div>
      </section>
    </div>
  );
}

'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { users } from '@/lib/data';
import { Award, Music, Users, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const featuredTeachers = users.filter(u => (u.role === 'Profesor' || u.role === 'Socio') && u.isVisibleToStudents).slice(0, 3);

  return (
    <div className="flex-1 bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[450px] flex items-center justify-center text-center text-white bg-gray-800">
        <Image
          src="https://placehold.co/1200x800.png"
          alt="Pareja bailando apasionadamente"
          layout="fill"
          objectFit="cover"
          className="opacity-40"
          priority
          data-ai-hint="couple dancing"
        />
        <div className="relative z-10 p-4">
          <h1 className="text-5xl md:text-7xl font-bold font-headline drop-shadow-lg">
            Donde la Pasión se Convierte en Arte
          </h1>
          <p className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto drop-shadow-md">
            Descubre un mundo de ritmo, conexión y expresión en FusionArte. Tu viaje en el baile comienza aquí.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/schedule">Ver Clases</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/memberships">Únete Ahora</Link>
            </Button>
          </div>
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

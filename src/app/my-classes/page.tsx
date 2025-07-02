'use client';

import { danceClasses } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, BookCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { userProfiles } from '@/components/layout/main-nav';

export default function MyClassesPage() {
  const router = useRouter();
  const { userRole } = useAuth();
  const teacherName = userRole ? userProfiles[userRole]?.name : '';
  
  const myClasses = danceClasses.filter(c => c.teacher === teacherName);
  const upcomingClasses = myClasses.slice(0, 3); // Example filter for upcoming

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Mis Clases</h1>
        <div className="text-right">
            <p className="font-bold text-lg">{teacherName}</p>
            <p className="text-sm text-muted-foreground">Profesora</p>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Resumen Semanal</CardTitle>
                <CardDescription>Tienes un total de <span className="font-bold text-primary">{myClasses.length}</span> clases asignadas.</CardDescription>
            </CardHeader>
            <CardContent>
                <h3 className="text-lg font-semibold mb-4 font-headline">Próximas Clases Destacadas</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingClasses.map(c => (
                         <Card key={c.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl">{c.name}</CardTitle>
                                <Badge variant="secondary" className="w-fit">{c.levelId}</Badge>
                            </CardHeader>
                            <CardContent className="flex-grow text-sm space-y-2 text-muted-foreground">
                                <p className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {c.day} - {c.time}</p>
                                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {c.room}</p>
                                <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {c.duration}</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" onClick={() => router.push(`/my-classes/${c.id}/attendance`)}>
                                    <Users className="mr-2 h-4 w-4" /> Ver Alumnos
                                </Button>
                            </CardFooter>
                         </Card>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Listado Completo de tus Clases</CardTitle>
                <CardDescription>Aquí puedes ver y gestionar todas las clases que impartes.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {myClasses.map(c => (
                        <li key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                            <div className="mb-4 sm:mb-0">
                                <p className="font-bold">{c.name} - {c.levelId}</p>
                                <p className="text-sm text-muted-foreground">{c.day} a las {c.time} en {c.room}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => router.push(`/my-classes/${c.id}/attendance`)}><Users className="mr-2 h-4 w-4" /> Alumnos</Button>
                                <Button variant="outline" size="sm" onClick={() => router.push(`/my-classes/${c.id}/attendance`)}><BookCheck className="mr-2 h-4 w-4" /> Pasar Lista</Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

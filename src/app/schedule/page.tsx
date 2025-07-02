
'use client';
import { useState } from 'react';
import { danceClasses, danceLevels as allLevels, danceStyles as allStyles } from '@/lib/data';
import type { DanceClass } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Award, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function CalendarClassCard({ danceClass }: { danceClass: DanceClass }) {
  const level = allLevels.find(l => l.id === danceClass.levelId);
  const style = allStyles.find(s => s.id === danceClass.styleId);

  return (
    <Card className="mb-4 overflow-hidden transition-shadow hover:shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-3">
         <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">{danceClass.name}</CardTitle>
            <Avatar className="h-8 w-8">
                <AvatarImage src={danceClass.teacherAvatar} alt={danceClass.teacher} />
                <AvatarFallback>{danceClass.teacher.charAt(0)}</AvatarFallback>
            </Avatar>
         </div>
         <CardDescription className="text-xs">{style?.name}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-xs space-y-2">
         <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-3 w-3" /> {danceClass.time} ({danceClass.duration})</div>
         <div className="flex items-center gap-2 text-muted-foreground"><User className="h-3 w-3" /> {danceClass.teacher}</div>
         <div className="flex items-center gap-2"><Award className="h-3 w-3" /> <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px]">{level?.name}</Badge></div>
      </CardContent>
    </Card>
  );
}

export default function SchedulePage() {
  const [styleFilter, setStyleFilter] = useState('Todos');
  const [levelFilter, setLevelFilter] = useState('Todos');

  const styles = ['Todos', ...Array.from(new Set(allStyles.map(s => s.name)))];
  const levels = ['Todos', ...Array.from(new Set(allLevels.map(l => l.name)))];

  const filteredClasses = danceClasses
    .filter(c => {
      const styleName = allStyles.find(s => s.id === c.styleId)?.name;
      const levelName = allLevels.find(l => l.id === c.levelId)?.name;
      const styleMatch = styleFilter === 'Todos' || styleName === styleFilter;
      const levelMatch = levelFilter === 'Todos' || levelName === levelFilter;
      return styleMatch && levelMatch;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const classesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = filteredClasses.filter(c => c.day === day);
    return acc;
  }, {} as Record<string, DanceClass[]>);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Horario de Clases</h1>
        <p className="text-lg text-muted-foreground">Encuentra tu ritmo. Reserva tu próxima clase.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-muted/50 rounded-lg sticky top-0 z-10 backdrop-blur-sm">
        <Tabs value={styleFilter} onValueChange={setStyleFilter} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:inline-flex h-auto flex-wrap">
            {styles.map(style => (
              <TabsTrigger key={style} value={style}>{style}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="w-full md:w-56">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por nivel" />
            </SelectTrigger>
            <SelectContent>
              {levels.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {daysOfWeek.map(day => (
            <div key={day} className="rounded-lg bg-muted/30 p-2">
              <h2 className="font-headline text-lg text-center font-bold mb-4 sticky top-28">{day}</h2>
              <div className="space-y-2">
                {classesByDay[day].length > 0 ? (
                  classesByDay[day].map(c => (
                    <CalendarClassCard key={c.id} danceClass={c} />
                  ))
                ) : (
                  <p className="text-xs text-center text-muted-foreground py-4">No hay clases programadas.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium font-headline">No se encontraron clases</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Intenta ajustar tus filtros para encontrar otras clases.
            </p>
        </div>
      )}
    </div>
  );
}

    
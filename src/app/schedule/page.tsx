
'use client';
import * as React from 'react';
import { useState, useMemo } from 'react';
import { danceClasses, danceLevels as allLevels, danceStyles as allStyles, users } from '@/lib/data';
import type { DanceClass } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Award, Users, CalendarDays, MapPin, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const timeSlots = Array.from({ length: (22 - 9) * 2 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
});

function TimeGridClassCard({ danceClass }: { danceClass: DanceClass }) {
    const style = allStyles.find(s => s.id === danceClass.styleId);
    const level = allLevels.find(l => l.id === danceClass.levelId);
    const getTeacherNames = (ids: number[]) => users.filter(u => ids.includes(u.id)).map(t => t.name).join(', ');
    
    const getCardColor = () => {
        if (danceClass.type === 'rental') return 'bg-gray-200/50 border-gray-400 dark:bg-gray-800/50 dark:border-gray-600';
        if (danceClass.status.startsWith('cancelled')) return 'bg-red-200/30 border-red-400/50 dark:bg-red-900/20 dark:border-red-500/30 line-through';
        switch(style?.id) {
            case 'salsa': return 'bg-red-200/50 border-red-400 dark:bg-red-800/20 dark:border-red-500/50';
            case 'bachata': return 'bg-blue-200/50 border-blue-400 dark:bg-blue-800/20 dark:border-blue-500/50';
            case 'hip-hop': return 'bg-yellow-200/50 border-yellow-400 dark:bg-yellow-800/20 dark:border-yellow-500/50';
            case 'contemporaneo': return 'bg-purple-200/50 border-purple-400 dark:bg-purple-800/20 dark:border-purple-500/50';
            case 'tango': return 'bg-indigo-200/50 border-indigo-400 dark:bg-indigo-800/20 dark:border-indigo-500/50';
            case 'flamenco': return 'bg-orange-200/50 border-orange-400 dark:bg-orange-800/20 dark:border-orange-500/50';
            default: return 'bg-green-200/50 border-green-400 dark:bg-green-800/20 dark:border-green-500/50';
        }
    }
    
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("rounded-md p-1.5 text-xs overflow-hidden border h-full m-0.5 cursor-pointer", getCardColor())}>
                        <p className="font-bold text-foreground truncate">{danceClass.name}</p>
                        <p className="text-muted-foreground truncate">{danceClass.room}</p>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="p-1 space-y-1.5 text-sm">
                        <p className="font-bold">{danceClass.name}</p>
                        <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> {getTeacherNames(danceClass.teacherIds) || 'N/A'}</div>
                        <div className="flex items-center gap-2 text-muted-foreground"><Award className="h-4 w-4" /> {level?.name || 'N/A'}</div>
                        <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {danceClass.time} ({danceClass.duration})</div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function WeeklySchedule({ classes }: { classes: DanceClass[] }) {
    const recurringClasses = classes.filter(c => c.type === 'recurring' && !c.isCancelledAndHidden);

    const timeToRow = (time: string) => {
        const [hour, minute] = time.split(':').map(Number);
        if (hour < 9) return 2;
        const totalMinutes = (hour - 9) * 60 + minute;
        return (totalMinutes / 30) + 2;
    };

    const durationToSpan = (duration: string) => {
        const minutes = parseInt(duration.replace(' min', ''));
        return Math.ceil(minutes / 30);
    };

    const dayToColumn = (day: string) => {
        return daysOfWeek.indexOf(day) + 2;
    }

    return (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-[auto_repeat(7,minmax(120px,1fr))] min-w-[900px] relative">
                {/* Headers */}
                <div className="sticky top-28 z-20 col-start-1 row-start-1" />
                {daysOfWeek.map((day, i) => (
                    <h2 key={day} className="font-headline text-center font-bold sticky top-28 py-2 z-20 bg-background/80 backdrop-blur-sm col-start-auto" style={{ gridColumn: i + 2 }}>
                        {day}
                    </h2>
                ))}
                
                {/* Time Slots and Grid Lines */}
                {timeSlots.map((time, index) => (
                   <React.Fragment key={time}>
                     <div className="row-start-auto col-start-1 h-12 flex items-start -mt-2.5 pr-2 sticky left-0 bg-background/80 backdrop-blur-sm z-10">
                        <span className="text-xs text-muted-foreground">{time}</span>
                    </div>
                     <div className="row-start-auto col-start-2 col-span-7 border-b border-dashed" style={{ gridRow: index + 2 }}/>
                   </React.Fragment>
                ))}

                {/* Classes */}
                {recurringClasses.map(c => {
                    const gridRowStart = timeToRow(c.time);
                    const gridRowEnd = `span ${durationToSpan(c.duration)}`;
                    const gridColumn = dayToColumn(c.day);
                    if (gridColumn < 2) return null;
                    return (
                        <div key={c.id} style={{ gridRow: `${gridRowStart} / ${gridRowEnd}`, gridColumn }} className="p-0 z-10">
                             <TimeGridClassCard danceClass={c} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function CalendarClassCard({ danceClass }: { danceClass: DanceClass }) {
  const level = allLevels.find(l => l.id === danceClass.levelId);
  const style = allStyles.find(s => s.id === danceClass.styleId);
  const getTeacherNames = (ids: number[]) => users.filter(u => ids.includes(u.id)).map(t => t.name).join(', ');

  return (
    <Card className={cn(
        "overflow-hidden transition-shadow hover:shadow-lg bg-card/80 backdrop-blur-sm w-full",
        danceClass.status.startsWith('cancelled') && "opacity-60"
    )}>
      <CardHeader className="p-4 flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className={cn("text-base font-bold", danceClass.status.startsWith('cancelled') && "line-through")}>{danceClass.name}</CardTitle>
              {danceClass.type !== 'rental' && <CardDescription className="text-xs">{style?.name}</CardDescription>}
            </div>
            {danceClass.type === 'rental' 
             ? <Badge variant="outline" className="flex items-center gap-1"><Building className="h-3 w-3" />Alquiler</Badge> 
             : <Badge variant="secondary">{level?.name}</Badge>}
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm space-y-2">
         <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {danceClass.time} ({danceClass.duration})</div>
         <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            {getTeacherNames(danceClass.teacherIds) || danceClass.name}
        </div>
         <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {danceClass.room}</div>
      </CardContent>
    </Card>
  );
}


function MonthlyCalendar({ classes }: { classes: DanceClass[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const singleEvents = classes.filter(c => 
        ['one-time', 'workshop', 'rental'].includes(c.type) &&
        c.date &&
        !c.isCancelledAndHidden &&
        (c.type !== 'rental' || c.isVisibleToStudents)
    );

    const eventsByDate = useMemo(() => {
        return singleEvents.reduce((acc, event) => {
            if (!event.date) return acc;
            const dateStr = format(parseISO(event.date), 'yyyy-MM-dd');
            (acc[dateStr] = acc[dateStr] || []).push(event);
            return acc;
        }, {} as Record<string, DanceClass[]>);
    }, [singleEvents]);

    const selectedDayEvents = date ? eventsByDate[format(date, 'yyyy-MM-dd')] || [] : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex justify-center">
                <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border w-full sm:w-auto"
                    locale={es}
                    modifiers={{
                       hasEvent: (day) => eventsByDate[format(day, 'yyyy-MM-dd')]
                    }}
                    modifiersStyles={{
                        hasEvent: {
                            fontWeight: 'bold',
                            color: 'hsl(var(--primary))'
                        }
                    }}
                />
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold font-headline">
                    {date ? `Eventos para ${format(date, 'PPP', { locale: es })}` : 'Selecciona un día'}
                </h3>
                {selectedDayEvents.length > 0 ? (
                    <div className="space-y-4">
                        {selectedDayEvents.map(c => <CalendarClassCard key={c.id} danceClass={c} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg h-full bg-muted/30">
                        <CalendarDays className="h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-4">No hay talleres ni eventos para este día.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


export default function SchedulePage() {
  const [styleFilter, setStyleFilter] = useState('Todos');
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [roomFilter, setRoomFilter] = useState('Todos');

  const styles = ['Todos', ...Array.from(new Set(allStyles.map(s => s.name)))];
  const levels = ['Todos', ...Array.from(new Set(allLevels.map(l => l.name)))];
  const rooms = ['Todos', ...Array.from(new Set(danceClasses.map(c => c.room)))];

  const filteredClassesForMonthly = danceClasses
    .filter(c => {
      const styleName = allStyles.find(s => s.id === c.styleId)?.name;
      const levelName = allLevels.find(l => l.id === c.levelId)?.name;
      const styleMatch = styleFilter === 'Todos' || styleName === styleFilter;
      const levelMatch = levelFilter === 'Todos' || levelName === levelFilter;
      return styleMatch && levelMatch;
    });

  const filteredClassesForWeekly = filteredClassesForMonthly.filter(c => {
      const roomMatch = roomFilter === 'Todos' || c.room === roomFilter;
      return roomMatch;
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Horario de Clases y Eventos</h1>
        <p className="text-lg text-muted-foreground">Encuentra tu ritmo. Reserva tu próxima clase o taller.</p>
      </div>

       <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-muted/50 rounded-lg sticky top-0 z-30 backdrop-blur-sm">
        <Tabs value={styleFilter} onValueChange={setStyleFilter} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:inline-flex h-auto flex-wrap">
            {styles.map(style => (
              <TabsTrigger key={style} value={style}>{style}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="w-full md:w-48">
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
        <div className="w-full md:w-48">
          <Select value={roomFilter} onValueChange={setRoomFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por sala" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map(room => (
                <SelectItem key={room} value={room}>{room}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

        <Tabs defaultValue="semanal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:w-fit mb-8">
                <TabsTrigger value="semanal">Horario Semanal</TabsTrigger>
                <TabsTrigger value="mensual">Calendario de Eventos</TabsTrigger>
            </TabsList>
            <TabsContent value="semanal">
                {filteredClassesForWeekly.filter(c => c.type === 'recurring').length > 0 ? (
                    <WeeklySchedule classes={filteredClassesForWeekly} />
                ) : (
                    <div className="text-center py-16">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium font-headline">No se encontraron clases</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Intenta ajustar tus filtros para encontrar otras clases.
                        </p>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="mensual">
                <MonthlyCalendar classes={filteredClassesForMonthly} />
            </TabsContent>
        </Tabs>
    </div>
  );
}


'use client';
import { useState, useMemo } from 'react';
import { danceClasses, danceLevels as allLevels, danceStyles as allStyles } from '@/lib/data';
import type { DanceClass } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Award, Users, CalendarDays, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parse, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const timeSlots = Array.from({ length: (22 - 9) * 2 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
});

function TimeGridClassCard({ danceClass }: { danceClass: DanceClass }) {
    const level = allLevels.find(l => l.id === danceClass.levelId);
    const style = allStyles.find(s => s.id === danceClass.styleId);
    const durationInMinutes = parseInt(danceClass.duration.replace(' min', ''));

    const getCardColor = () => {
        switch(style?.id) {
            case 'salsa': return 'bg-red-200/50 border-red-400';
            case 'bachata': return 'bg-blue-200/50 border-blue-400';
            case 'hip-hop': return 'bg-yellow-200/50 border-yellow-400';
            case 'contemporaneo': return 'bg-purple-200/50 border-purple-400';
            case 'tango': return 'bg-gray-300/50 border-gray-500';
            case 'flamenco': return 'bg-orange-200/50 border-orange-400';
            default: return 'bg-green-200/50 border-green-400';
        }
    }
    
    return (
        <div className={cn("rounded-lg p-2 text-xs overflow-y-auto border", getCardColor())}>
            <p className="font-bold text-black">{danceClass.name}</p>
            <p className="text-gray-700">{danceClass.teacher}</p>
            {durationInMinutes > 45 && <p className="text-gray-600 text-[10px]">{danceClass.room}</p>}
            {durationInMinutes > 60 && <p className="text-gray-600 text-[10px]">{level?.name}</p>}
        </div>
    )
}

function WeeklySchedule({ classes }: { classes: DanceClass[] }) {
    const recurringClasses = classes.filter(c => c.recurrence === 'recurring');

    const timeToRow = (time: string) => {
        const [hour, minute] = time.split(':').map(Number);
        const totalMinutes = (hour - 9) * 60 + minute;
        return (totalMinutes / 30) + 2; // +2 to account for header row
    };

    const durationToSpan = (duration: string) => {
        const minutes = parseInt(duration.replace(' min', ''));
        return Math.ceil(minutes / 30);
    };

    const dayToColumn = (day: string) => {
        return daysOfWeek.indexOf(day) + 2; // +2 to account for time column
    }

    return (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-[auto_repeat(7,minmax(120px,1fr))] grid-rows-[auto] min-w-[900px]">
                <div className="sticky top-28 z-10 bg-background/80 backdrop-blur-sm"></div>
                {daysOfWeek.map(day => (
                    <h2 key={day} className="font-headline text-lg text-center font-bold mb-4 sticky top-28 py-2 bg-background/80 backdrop-blur-sm">
                        {day}
                    </h2>
                ))}

                {timeSlots.map(time => (
                    <div key={time} className="col-start-1 row-start-auto h-12 flex items-start -mt-2 pr-2">
                        <span className="text-xs text-muted-foreground">{time}</span>
                    </div>
                ))}
                
                 {/* Grid lines */}
                {timeSlots.map((_, index) => (
                    <div key={`line-${index}`} className="col-start-1 col-span-8 row-start-auto border-b border-dashed" style={{ gridRow: index + 2 }}/>
                ))}


                {recurringClasses.map(c => {
                    const gridRowStart = timeToRow(c.time);
                    const gridRowEnd = `span ${durationToSpan(c.duration)}`;
                    const gridColumn = dayToColumn(c.day);
                    return (
                        <div key={c.id} style={{ gridRowStart, gridRowEnd, gridColumn }} className="p-1">
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

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg bg-card/80 backdrop-blur-sm w-full">
      <CardHeader className="p-4 flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold">{danceClass.name}</CardTitle>
              <CardDescription className="text-xs">{style?.name}</CardDescription>
            </div>
             <Badge variant="secondary">{level?.name}</Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm space-y-2">
         <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {danceClass.time} ({danceClass.duration})</div>
         <div className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> {danceClass.teacher}</div>
         <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {danceClass.room}</div>
      </CardContent>
    </Card>
  );
}


function MonthlyCalendar({ classes }: { classes: DanceClass[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const workshops = classes.filter(c => c.recurrence === 'one-time' && c.date);

    const workshopsByDate = useMemo(() => {
        return workshops.reduce((acc, workshop) => {
            if (!workshop.date) return acc;
            const dateStr = format(parseISO(workshop.date), 'yyyy-MM-dd');
            (acc[dateStr] = acc[dateStr] || []).push(workshop);
            return acc;
        }, {} as Record<string, DanceClass[]>);
    }, [workshops]);

    const selectedDayWorkshops = date ? workshopsByDate[format(date, 'yyyy-MM-dd')] || [] : [];

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
                       hasWorkshop: (day) => workshopsByDate[format(day, 'yyyy-MM-dd')]
                    }}
                    modifiersStyles={{
                        hasWorkshop: {
                            fontWeight: 'bold',
                            color: 'hsl(var(--primary))'
                        }
                    }}
                />
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold font-headline">
                    {date ? `Talleres para ${format(date, 'PPP', { locale: es })}` : 'Selecciona un día'}
                </h3>
                {selectedDayWorkshops.length > 0 ? (
                    <div className="space-y-4">
                        {selectedDayWorkshops.map(c => <CalendarClassCard key={c.id} danceClass={c} />)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg h-full bg-muted/30">
                        <CalendarDays className="h-12 w-12 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mt-4">No hay talleres para este día.</p>
                    </div>
                )}
            </div>
        </div>
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
    });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Horario de Clases</h1>
        <p className="text-lg text-muted-foreground">Encuentra tu ritmo. Reserva tu próxima clase o taller.</p>
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
            <Tabs defaultValue="semanal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-fit mb-8">
                    <TabsTrigger value="semanal">Horario Semanal</TabsTrigger>
                    <TabsTrigger value="mensual">Talleres del Mes</TabsTrigger>
                </TabsList>
                <TabsContent value="semanal">
                    <WeeklySchedule classes={filteredClasses} />
                </TabsContent>
                <TabsContent value="mensual">
                    <MonthlyCalendar classes={filteredClasses} />
                </TabsContent>
            </Tabs>
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

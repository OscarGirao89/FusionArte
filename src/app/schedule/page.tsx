'use client';
import { useState } from 'react';
import { danceClasses } from '@/lib/data';
import type { DanceClass } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Award } from 'lucide-react';

function ClassCard({ danceClass }: { danceClass: DanceClass }) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline text-2xl">{danceClass.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    <Award className="h-4 w-4" /> {danceClass.level}
                </CardDescription>
            </div>
            <div className="text-right">
                <Avatar>
                    <AvatarImage src={danceClass.teacherAvatar} alt={danceClass.teacher} />
                    <AvatarFallback>{danceClass.teacher.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="text-xs text-muted-foreground mt-1">{danceClass.teacher}</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" /> <span>{danceClass.day} at {danceClass.time}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" /> <span>{danceClass.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" /> <span>{danceClass.room}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-primary hover:bg-primary/90">Enroll Now</Button>
      </CardFooter>
    </Card>
  );
}

export default function SchedulePage() {
  const [styleFilter, setStyleFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All Levels');

  const styles = ['All', ...Array.from(new Set(danceClasses.map(c => c.style)))];
  const levels = ['All Levels', ...Array.from(new Set(danceClasses.map(c => c.level)))];

  const filteredClasses = danceClasses.filter(c => {
    const styleMatch = styleFilter === 'All' || c.style === styleFilter;
    const levelMatch = levelFilter === 'All Levels' || c.level === levelFilter;
    return styleMatch && levelMatch;
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Class Schedule</h1>
        <p className="text-lg text-muted-foreground">Find your rhythm. Book your next class.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Tabs value={styleFilter} onValueChange={setStyleFilter} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 md:inline-flex">
            {styles.map(style => (
              <TabsTrigger key={style} value={style}>{style}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="w-full md:w-48">
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by level" />
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredClasses.map(c => (
            <ClassCard key={c.id} danceClass={c} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium font-headline">No Classes Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters to find other classes.
            </p>
        </div>
      )}
    </div>
  );
}

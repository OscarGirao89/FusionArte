import { teachers } from '@/lib/data';
import type { Teacher } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

function TeacherCard({ teacher }: { teacher: Teacher }) {
    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-xl">
            <CardHeader className="p-0">
                <Image
                    src={teacher.avatar}
                    alt={`Foto de ${teacher.name}`}
                    width={400}
                    height={400}
                    className="w-full h-auto object-cover"
                    data-ai-hint="portrait professional"
                />
            </CardHeader>
            <CardContent className="p-6">
                <CardTitle className="font-headline text-2xl mb-2">{teacher.name}</CardTitle>
                <CardDescription className="mb-4">{teacher.bio}</CardDescription>
                <div className="flex flex-wrap gap-2">
                    {teacher.specialties.map(specialty => (
                        <Badge key={specialty} variant="secondary">{specialty}</Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function TeachersPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Conoce a Nuestros Instructores</h1>
        <p className="text-lg text-muted-foreground">
          Apasionados, experimentados y dedicados a ayudarte a crecer como bailarín/a.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {teachers.map(teacher => (
          <TeacherCard key={teacher.name} teacher={teacher} />
        ))}
      </div>
    </div>
  );
}

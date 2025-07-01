
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked } from 'lucide-react';

export default function MyClassesPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Mis Clases</h1>
      <Card>
        <CardHeader>
          <CardTitle>Clases Asignadas</CardTitle>
          <CardDescription>Aquí podrás ver y gestionar las clases que impartes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
            <BookMarked className="h-12 w-12 mb-4" />
            <p>La funcionalidad de gestión de clases para profesores estará disponible próximamente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

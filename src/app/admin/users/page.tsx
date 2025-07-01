import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Gestión de Usuarios</h1>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>Aquí puedes ver y gestionar todos los usuarios de la plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
            <Users className="h-12 w-12 mb-4" />
            <p>La funcionalidad de gestión de usuarios estará disponible próximamente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreVertical, UserPlus } from 'lucide-react';

const users = [
  { id: 1, name: 'Ana López', email: 'ana.lopez@example.com', role: 'Estudiante', joined: '2023-09-01', avatar: 'https://placehold.co/100x100.png?text=AL' },
  { id: 2, name: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', role: 'Profesor', joined: '2022-05-20', avatar: 'https://placehold.co/100x100.png?text=CR' },
  { id: 3, name: 'Beatriz Sanz', email: 'beatriz.sanz@example.com', role: 'Estudiante', joined: '2024-01-15', avatar: 'https://placehold.co/100x100.png?text=BS' },
  { id: 4, name: 'Admin FusionArte', email: 'admin@fusionarte.com', role: 'Administrador', joined: '2022-01-01', avatar: 'https://placehold.co/100x100.png?text=AF' },
  { id: 5, name: 'Elena Garcia', email: 'elena.garcia@example.com', role: 'Profesor', joined: '2022-03-10', avatar: 'https://placehold.co/100x100.png?text=EG' },
  { id: 6, name: 'Liam Smith', email: 'liam.smith@example.com', role: 'Profesor', joined: '2023-08-11', avatar: 'https://placehold.co/100x100.png?text=LS' },
];

const roleVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
    'Administrador': 'destructive',
    'Profesor': 'default',
    'Estudiante': 'secondary'
}

export default function AdminUsersPage() {
  return (
    <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Usuarios</h1>
            <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Añadir Usuario
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>Aquí puedes ver y gestionar todos los usuarios de la plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Rol</TableHead>
                <TableHead className="hidden md:table-cell">Fecha de Ingreso</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person face" />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={roleVariant[user.role] || 'secondary'}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.joined}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Acciones</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flame, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = () => {
    login(selectedRole);
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="h-10 w-10 text-primary" />
            <span className="font-bold text-3xl font-headline">FusionArte</span>
          </div>
          <CardTitle className="text-2xl">Bienvenido/a</CardTitle>
          <CardDescription>Selecciona un rol para iniciar sesión y probar la aplicación.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Rol de Usuario</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Estudiante</SelectItem>
                  <SelectItem value="teacher">Profesor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLogin} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, User } from 'lucide-react';
import { LogoIcon } from '@/components/icons/logo-icon';

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = () => {
    login(selectedRole);
    if (selectedRole === 'student') {
      router.push('/profile');
    } else if (selectedRole === 'teacher') {
      router.push('/my-classes');
    } else {
      router.push('/admin/users'); // A sensible default for admin roles
    }
  };

  const handleGuestAccess = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <LogoIcon className="h-10 w-10 text-primary" />
            <span className="font-bold text-3xl font-headline">FusionArte</span>
          </div>
          <CardTitle className="text-2xl">Bienvenido/a</CardTitle>
          <CardDescription>Selecciona un rol para simular el inicio de sesión o explora el sitio como invitado.</CardDescription>
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
                  <SelectItem value="socio">Socio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLogin} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar Sesión
            </Button>
            
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    O
                    </span>
                </div>
            </div>

            <Button onClick={handleGuestAccess} variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Continuar como Invitado
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

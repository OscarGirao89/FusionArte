import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Configuración</h1>
      <Card>
        <CardHeader>
          <CardTitle>Ajustes Generales</CardTitle>
          <CardDescription>Configura los ajustes generales de la academia de baile FusionArte.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
            <Settings className="h-12 w-12 mb-4" />
            <p>La página de configuración estará disponible próximamente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

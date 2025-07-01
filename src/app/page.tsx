import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Overview } from '@/components/dashboard/overview';
import { UpcomingClasses } from '@/components/dashboard/upcoming-classes';
import { SmartSuggestion } from '@/components/dashboard/smart-suggestion';
import { HandHelping, CalendarClock, Bot } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membresía</CardTitle>
            <HandHelping className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Plan Oro</div>
            <p className="text-xs text-muted-foreground">Expira el 24 de Dic, 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clases Restantes</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">de tu paquete de 10 clases</p>
          </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistente IA</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¿Necesitas Ayuda?</div>
            <p className="text-xs text-muted-foreground">Obtén sugerencias de clases</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Rendimiento de Profesores</CardTitle>
            <CardDescription>
              Clases mensuales impartidas por cada profesor.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Próximas Clases</CardTitle>
            <CardDescription>Tienes 3 clases esta semana.</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingClasses />
          </CardContent>
        </Card>
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Bot size={24} className="text-primary"/>
                    Sugerencias Inteligentes de Clases
                </CardTitle>
                <CardDescription>
                    ¿No puedes asistir a una clase? Encuentra la alternativa perfecta con nuestro asistente de IA.
                    Solo dinos tus preferencias y el conflicto, y nosotros haremos el resto.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SmartSuggestion />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

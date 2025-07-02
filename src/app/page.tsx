
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Overview } from '@/components/dashboard/overview';
import { UpcomingClasses } from '@/components/dashboard/upcoming-classes';
import { SmartSuggestion } from '@/components/dashboard/smart-suggestion';
import { HandHelping, CalendarClock, Bot, Users, BarChart } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { danceClasses, danceStyles, users as allUsers } from '@/lib/data';
import { userProfiles } from '@/components/layout/main-nav';

function StudentDashboard() {
  const popularStylesData = [
    { name: 'Salsa', total: 420 },
    { name: 'Bachata', total: 510 },
    { name: 'M-Zouk', total: 280 },
    { name: 'Aeroyoga', total: 150 },
    { name: 'Elongación', total: 350 },
  ];

  const popularStylesConfig = {
    total: {
      label: 'Inscripciones',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <>
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
            <CardTitle className="font-headline">Popularidad de Estilos</CardTitle>
            <CardDescription>
              Inscripciones totales por estilo de baile este año.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={popularStylesData} config={popularStylesConfig} categoryKey="name" dataKey="total"/>
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
    </>
  )
}

function TeacherDashboard() {
  const { userRole } = useAuth();
  const currentUserId = userRole ? userProfiles[userRole]?.id : null;
  const myClasses = danceClasses.filter(c => c.teacherIds.includes(currentUserId!));

  const classesByDay = myClasses.reduce((acc, currentClass) => {
      const day = currentClass.day;
      if (!acc[day]) {
          acc[day] = 0;
      }
      acc[day]++;
      return acc;
  }, {} as Record<string, number>);
  
  const daysOrder = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  
  const teacherPerformanceData = daysOrder.map(day => ({
      name: day.substring(0,3),
      total: classesByDay[day] || 0
  }));

  const teacherChartConfig = {
      total: { label: "Clases", color: "hsl(var(--chart-1))" },
  };

  return (
     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Tus Clases de la Semana</CardTitle>
            <CardDescription>
              Número de clases que impartes cada día.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={teacherPerformanceData} config={teacherChartConfig} categoryKey="name" dataKey="total" />
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Tus Próximas Clases</CardTitle>
            <CardDescription>Estas son algunas de tus próximas clases.</CardDescription>
          </CardHeader>
          <CardContent>
            <UpcomingClasses />
          </CardContent>
        </Card>
      </div>
  )
}

function AdminDashboard() {
   const teacherData = allUsers.filter(u => u.role === 'Profesor' || u.role === 'Socio').map(teacher => {
        return {
            name: teacher.name.split(' ')[0], // Use first name
            total: danceClasses.filter(c => c.teacherIds.includes(teacher.id) && c.status === 'completed').length,
        }
    });
   const teacherPerformanceConfig = {
      total: { label: 'Clases', color: 'hsl(var(--primary))' },
    };

  return (
    <>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">+5 que el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clases Programadas</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">para esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistente IA</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Listo para ayudar</div>
            <p className="text-xs text-muted-foreground">Gestiona la academia</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="font-headline">Rendimiento General de Profesores</CardTitle>
            <CardDescription>
              Clases mensuales completadas por cada profesor.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={teacherData} config={teacherPerformanceConfig} categoryKey="name" dataKey="total" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function DashboardPage() {
  const { userRole } = useAuth();

  const renderDashboard = () => {
    switch(userRole) {
      case 'student':
        return <StudentDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'administrativo':
        return <AdminDashboard />; // Same as admin for now
      case 'socio':
        return <AdminDashboard />; // Same as admin for now
      default:
        return <div>Cargando...</div>;
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      </div>
      {renderDashboard()}
    </div>
  );
}

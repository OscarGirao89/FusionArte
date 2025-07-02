'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TeacherPayroll } from '@/components/admin/teacher-payroll';
import { IncomeExpenseLedger } from '@/components/admin/income-expense-ledger';
import { DollarSign, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { studentPayments, extraTransactions } from '@/lib/finances-data';
import { danceClasses } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import { userProfiles } from '@/components/layout/main-nav';

export default function AdminFinancesPage() {
  const { userRole } = useAuth();
  const currentUserId = userRole ? userProfiles[userRole]?.id : null;

  const studentIncome = studentPayments.reduce((acc, p) => acc + p.amountPaid, 0);
  const otherIncome = extraTransactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const rentalIncome = danceClasses.filter(c => c.type === 'rental' && c.rentalPrice).reduce((acc, c) => acc + (c.rentalPrice || 0), 0);
  const totalIncome = studentIncome + otherIncome + rentalIncome;

  const totalExpenses = extraTransactions.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
  // Note: Teacher payroll is not included in this calculation, it's shown separately.
  // In a real app, paid payrolls would be added as expenses.

  const netBalance = totalIncome - totalExpenses;

  const pageTitle = userRole === 'socio' ? 'Finanzas del Socio y del Estudio' : 'Finanzas Generales';

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">{pageTitle}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Membresías, alquileres y otros</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gastos operativos y otros</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{netBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Ingresos - Egresos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ver Nómina</div>
            <p className="text-xs text-muted-foreground">Pagos a calcular a profesores</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 mt-8">
        <TeacherPayroll userRole={userRole} userId={currentUserId} />
        
        {(userRole === 'admin' || userRole === 'socio') && (
            <Card>
            <CardHeader>
                <CardTitle>Libro de Transacciones del Estudio</CardTitle>
                <CardDescription>Registra y consulta todos los movimientos financieros generales.</CardDescription>
            </CardHeader>
            <CardContent>
                <IncomeExpenseLedger />
            </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

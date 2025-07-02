
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TeacherPayroll } from '@/components/admin/teacher-payroll';
import { IncomeExpenseLedger } from '@/components/admin/income-expense-ledger';
import { DollarSign, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { studentPayments, extraTransactions } from '@/lib/finances-data';

export default function AdminFinancesPage() {
  const studentIncome = studentPayments.reduce((acc, p) => acc + p.amount, 0);
  const otherIncome = extraTransactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = studentIncome + otherIncome;

  const totalExpenses = extraTransactions.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
  // Note: Teacher payroll is not included in this calculation, it's shown separately.
  // In a real app, paid payrolls would be added as expenses.

  const netBalance = totalIncome - totalExpenses;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-8">Finanzas</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ingresos de membresías y otros</p>
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
        <TeacherPayroll />
        <IncomeExpenseLedger />
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TeacherPayroll } from '@/components/admin/teacher-payroll';
import { IncomeExpenseLedger } from '@/components/admin/income-expense-ledger';
import { DollarSign, TrendingUp, TrendingDown, Scale, Wallet, Bank, Users, Handshake, Briefcase } from 'lucide-react';
import { studentPayments, extraTransactions } from '@/lib/finances-data';
import { danceClasses, users } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import { userProfiles } from '@/components/layout/main-nav';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function AdminFinancesPage() {
  const { userRole, userId } = useAuth();
  const router = useRouter();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  const partners = users.filter(u => u.isPartner);
  if (partners.length > 0 && !selectedPartnerId) {
      setSelectedPartnerId(String(partners[0].id));
  }

  const studentIncome = studentPayments.reduce((acc, p) => acc + p.amount, 0);
  const otherIncome = extraTransactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const rentalIncome = danceClasses.filter(c => c.type === 'rental' && c.rentalPrice).reduce((acc, c) => acc + (c.rentalPrice || 0), 0);
  const totalIncome = studentIncome + otherIncome + rentalIncome;

  const totalExpenses = extraTransactions.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
  // Note: Teacher payroll is calculated as a separate item, not included in this high-level card.

  const netBalance = totalIncome - totalExpenses;

  const AdminView = () => (
    <div className='space-y-8'>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline"><Bank className="h-6 w-6"/> Finanzas del Estudio</CardTitle>
                <CardDescription>Visión general de los ingresos y egresos de la academia, excluyendo los pagos a socios.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-8">
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales (Estudio)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">€{totalIncome.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Membresías, alquileres y otros</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Egresos Operativos</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Gastos, suministros, etc.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Balance Neto (Estudio)</CardTitle>
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
                        <CardTitle className="text-sm font-medium">Nóminas (No Socios)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">Ver Desglose</div>
                        <p className="text-xs text-muted-foreground">Pagos a profesores</p>
                      </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Libro de Transacciones del Estudio</CardTitle>
                            <CardDescription>Registra y consulta todos los movimientos financieros generales.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IncomeExpenseLedger />
                        </CardContent>
                    </Card>
                    <TeacherPayroll mode="studio_expenses" />
                </div>
            </CardContent>
        </Card>
        
        <Separator />
        
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 font-headline"><Handshake className="h-6 w-6"/> Finanzas de Socios</CardTitle>
                        <CardDescription>Selecciona un socio para ver el desglose de sus ingresos generados.</CardDescription>
                    </div>
                    <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                        <SelectTrigger className="w-full md:w-[250px]">
                            <SelectValue placeholder="Seleccionar socio..." />
                        </SelectTrigger>
                        <SelectContent>
                            {partners.map(p => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                {selectedPartnerId && <TeacherPayroll mode="partner_income" partnerId={parseInt(selectedPartnerId, 10)} />}
            </CardContent>
        </Card>
    </div>
  );

  const PartnerView = () => (
    <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">Mis Finanzas</TabsTrigger>
            <TabsTrigger value="studio">Finanzas del Estudio</TabsTrigger>
        </TabsList>
        <TabsContent value="personal" className="mt-6">
            <TeacherPayroll mode="partner_income" partnerId={userId} />
        </TabsContent>
        <TabsContent value="studio" className="mt-6 space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ingresos Totales (Estudio)</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">€{totalIncome.toFixed(2)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Egresos Operativos</CardTitle><TrendingDown className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Balance Neto (Estudio)</CardTitle><Scale className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>€{netBalance.toFixed(2)}</div></CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Nóminas (No Socios)</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">Ver Desglose</div></CardContent>
                </Card>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>Libro de Transacciones del Estudio</CardTitle></CardHeader>
                    <CardContent><IncomeExpenseLedger /></CardContent>
                </Card>
                <TeacherPayroll mode="studio_expenses" />
            </div>
        </TabsContent>
    </Tabs>
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Panel de Finanzas</h1>
        <Button onClick={() => router.push('/admin/payments')}>
            <Wallet className="mr-2 h-4 w-4" />
            Gestionar Pagos de Alumnos
        </Button>
      </div>
        {userRole === 'admin' && <AdminView />}
        {userRole === 'socio' && <PartnerView />}
    </div>
  );
}

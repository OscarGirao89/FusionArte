'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TeacherPayroll } from '@/components/admin/teacher-payroll';
import { IncomeExpenseLedger } from '@/components/admin/income-expense-ledger';
import { DollarSign, TrendingUp, TrendingDown, Scale, Wallet, Landmark, Users, Handshake, Briefcase, FileText, PlusCircle, Download, Printer, Edit } from 'lucide-react';
import { extraTransactions } from '@/lib/finances-data';
import { danceClasses, users, membershipPlans } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { userProfiles } from '@/components/layout/main-nav';
import type { StudentPayment } from '@/lib/types';


const paymentEditSchema = z.object({
  id: z.string(),
  status: z.enum(['paid', 'pending', 'deposit']),
  amountPaid: z.coerce.number().min(0, "El monto no puede ser negativo."),
});
type PaymentEditFormValues = z.infer<typeof paymentEditSchema>;

const newInvoiceSchema = z.object({
  studentId: z.string().min(1, "Debes seleccionar un alumno."),
  planId: z.string().min(1, "Debes seleccionar un plan."),
});
type NewInvoiceFormValues = z.infer<typeof newInvoiceSchema>;


function StudentPaymentsSection() {
  const { studentPayments: payments, addStudentPayment, updateStudentMembership, userRole } = useAuth();
  const [editingPayment, setEditingPayment] = useState<StudentPayment | null>(null);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const { toast } = useToast();
  
  const canEdit = userRole === 'admin' || userRole === 'administrativo' || userRole === 'socio';
  const canCreate = userRole === 'admin' || userRole === 'administrativo' || userRole === 'socio';

  const students = users.filter(u => u.role === 'Estudiante');

  const editForm = useForm<PaymentEditFormValues>({
    resolver: zodResolver(paymentEditSchema),
  });

  const newInvoiceForm = useForm<NewInvoiceFormValues>({
      resolver: zodResolver(newInvoiceSchema),
  });

  const watchedStatus = editForm.watch('status');

  useEffect(() => {
    if (watchedStatus === 'paid' && editingPayment) {
      editForm.setValue('amountPaid', editingPayment.totalAmount, { shouldValidate: true });
    }
  }, [watchedStatus, editingPayment, editForm]);
  
  const getStudentName = (id: number) => users.find(u => u.id === id)?.name || 'Desconocido';
  const getPlanName = (id: string) => membershipPlans.find(p => p.id === id)?.title || 'Desconocido';
  const getEditorName = () => userRole ? userProfiles[userRole].name : 'Sistema';

  const handleOpenEditDialog = (payment: StudentPayment) => {
    setEditingPayment(payment);
    editForm.reset({
      id: payment.id,
      status: payment.status,
      amountPaid: payment.amountPaid,
    });
  };
  
  const onEditSubmit = (data: PaymentEditFormValues) => {
    if (!editingPayment) return;
    
    const totalAmount = editingPayment.totalAmount;
    if (data.amountPaid > totalAmount) {
        editForm.setError("amountPaid", { type: "manual", message: "El monto pagado no puede exceder el total."});
        return;
    }

    const updatedPayment = {
        ...editingPayment,
        status: data.status,
        amountPaid: data.amountPaid,
        amountDue: totalAmount - data.amountPaid,
        lastUpdatedBy: getEditorName(),
        lastUpdatedDate: new Date().toISOString()
    };
    
    addStudentPayment(updatedPayment, true); // true to indicate update

    toast({ title: "Pago actualizado", description: "El estado del pago ha sido guardado." });
    setEditingPayment(null);
  }

  const onNewInvoiceSubmit = (data: NewInvoiceFormValues) => {
      const student = users.find(u => u.id === Number(data.studentId));
      const plan = membershipPlans.find(p => p.id === data.planId);

      if (!student || !plan) {
          toast({ title: "Error", description: "Alumno o plan no encontrado.", variant: "destructive" });
          return;
      }
      
      const newPayment: StudentPayment = {
          id: `inv-${Date.now()}`,
          studentId: student.id,
          planId: plan.id,
          invoiceDate: new Date().toISOString(),
          totalAmount: plan.price,
          status: 'pending',
          amountPaid: 0,
          amountDue: plan.price,
          lastUpdatedBy: getEditorName(),
          lastUpdatedDate: new Date().toISOString(),
      };

      addStudentPayment(newPayment);

      const membershipEndDate = new Date();
      membershipEndDate.setMonth(membershipEndDate.getMonth() + plan.durationValue);
      
      updateStudentMembership(student.id, {
          planId: plan.id,
          startDate: new Date().toISOString(),
          endDate: membershipEndDate.toISOString(),
          classesRemaining: plan.accessType === 'class_pack' ? plan.classCount : undefined,
      });

      toast({ title: "Factura creada", description: `Se ha creado una factura para ${student.name}.` });
      setIsNewInvoiceOpen(false);
      newInvoiceForm.reset();
  }

  const handleExportCSV = () => {
    const headers = ["ID", "Alumno", "Plan", "Monto Total", "Monto Pagado", "Monto Pendiente", "Estado", "Fecha Factura"];
    const csvRows = [headers.join(',')];
    
    payments.forEach(p => {
      const row = [
        p.id,
        `"${getStudentName(p.studentId)}"`,
        `"${getPlanName(p.planId)}"`,
        p.totalAmount,
        p.amountPaid,
        p.amountDue,
        p.status,
        p.invoiceDate,
      ].join(',');
      csvRows.push(row);
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'pagos_alumnos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePrint = () => window.print();

  return (
      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <CardTitle>Pagos de Alumnos</CardTitle>
                    <CardDescription>Gestiona los pagos de las membresías de los alumnos.</CardDescription>
                </div>
                 <div className="flex gap-2 flex-shrink-0 flex-wrap no-print">
                    {canCreate && (
                        <Dialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Crear Factura</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Crear Nueva Factura</DialogTitle>
                                    <DialogDescription>Genera una nueva factura para un alumno.</DialogDescription>
                                </DialogHeader>
                                <Form {...newInvoiceForm}>
                                    <form onSubmit={newInvoiceForm.handleSubmit(onNewInvoiceSubmit)} className="space-y-4 py-4">
                                          <FormField control={newInvoiceForm.control} name="studentId" render={({ field }) => (
                                          <FormItem><FormLabel>Alumno</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar alumno..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                              {students.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                                            </SelectContent>
                                          </Select><FormMessage /></FormItem>
                                        )} />
                                          <FormField control={newInvoiceForm.control} name="planId" render={({ field }) => (
                                          <FormItem><FormLabel>Plan de Membresía</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar plan..." /></SelectTrigger></FormControl>
                                            <SelectContent>
                                              {membershipPlans.map(p => <SelectItem key={p.id} value={p.id}>{p.title} (€{p.price})</SelectItem>)}
                                            </SelectContent>
                                          </Select><FormMessage /></FormItem>
                                        )} />
                                        <DialogFooter>
                                            <Button type="button" variant="ghost" onClick={() => setIsNewInvoiceOpen(false)}>Cancelar</Button>
                                            <Button type="submit">Crear Factura</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    )}
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" /> Exportar CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimir
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Pagado</TableHead>
                  <TableHead className="text-right">Pendiente</TableHead>
                  <TableHead className="no-print">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                        <p className="font-medium">{getStudentName(p.studentId)}</p>
                        <p className="text-xs text-muted-foreground">{format(parseISO(p.invoiceDate), 'dd/MM/yyyy')}</p>
                    </TableCell>
                    <TableCell>{getPlanName(p.planId)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'paid' ? 'default' : p.status === 'pending' ? 'destructive' : 'secondary'}>
                        {{
                          paid: 'Pagado',
                          pending: 'Pendiente',
                          deposit: 'Adelanto'
                        }[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">€{p.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">€{p.amountPaid.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono text-red-600">€{p.amountDue.toFixed(2)}</TableCell>
                    <TableCell className="no-print">
                      {canEdit && (
                          <Dialog open={editingPayment?.id === p.id} onOpenChange={(isOpen) => !isOpen && setEditingPayment(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(p)}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Editar Estado de Pago</DialogTitle>
                                    <DialogDescription>
                                        Actualiza el estado del pago para {getStudentName(p.studentId)}.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...editForm}>
                                    <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
                                         <FormField control={editForm.control} name="status" render={({ field }) => (
                                          <FormItem><FormLabel>Estado del Pago</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                              <SelectItem value="pending">Pendiente</SelectItem>
                                              <SelectItem value="deposit">Adelanto</SelectItem>
                                              <SelectItem value="paid">Pagado</SelectItem>
                                            </SelectContent>
                                          </Select><FormMessage /></FormItem>
                                        )} />
                                         <FormField control={editForm.control} name="amountPaid" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Monto Pagado (€)</FormLabel>
                                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <DialogFooter>
                                            <Button type="button" variant="ghost" onClick={() => setEditingPayment(null)}>Cancelar</Button>
                                            <Button type="submit">Guardar</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                          </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
  )
}

export default function AdminFinancesPage() {
  const { userRole, userId, studentPayments, addStudentPayment, updateStudentMembership } = useAuth();
  const router = useRouter();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

  const partners = users.filter(u => u.isPartner);
  if (partners.length > 0 && !selectedPartnerId) {
      setSelectedPartnerId(String(partners[0].id));
  }

  const studentIncome = studentPayments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amountPaid, 0);
  const otherIncome = extraTransactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const rentalIncome = danceClasses.filter(c => c.type === 'rental' && c.rentalPrice).reduce((acc, c) => acc + (c.rentalPrice || 0), 0);
  const totalIncome = studentIncome + otherIncome + rentalIncome;

  const totalExpenses = extraTransactions.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const AdminView = () => (
     <Tabs defaultValue="studio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="studio">Finanzas del Estudio</TabsTrigger>
            <TabsTrigger value="partners">Finanzas de Socios</TabsTrigger>
        </TabsList>
        <TabsContent value="studio" className="mt-6 space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Ingresos Totales (Estudio)</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">€{totalIncome.toFixed(2)}</div><p className="text-xs text-muted-foreground">Membresías, alquileres y otros</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Egresos Operativos</CardTitle><TrendingDown className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</div><p className="text-xs text-muted-foreground">Gastos, suministros, etc.</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Balance Neto (Estudio)</CardTitle><Scale className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>€{netBalance.toFixed(2)}</div><p className="text-xs text-muted-foreground">Ingresos - Egresos</p></CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Nóminas (No Socios)</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader>
                    <CardContent><div className="text-2xl font-bold">Ver Desglose</div><p className="text-xs text-muted-foreground">Pagos a profesores</p></CardContent>
                </Card>
            </div>
            
            <StudentPaymentsSection />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                      <CardTitle>Libro de Transacciones (General)</CardTitle>
                      <CardDescription>Otros ingresos y egresos operativos.</CardDescription>
                    </CardHeader>
                    <CardContent><IncomeExpenseLedger /></CardContent>
                </Card>
                <TeacherPayroll mode="studio_expenses" />
            </div>
        </TabsContent>
        <TabsContent value="partners" className="mt-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2 font-headline"><Handshake className="h-6 w-6"/> Finanzas de Socios</CardTitle>
                            <CardDescription>Selecciona un socio para ver el desglose de sus ingresos generados.</CardDescription>
                        </div>
                        <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                            <SelectTrigger className="w-full md:w-[250px]"><SelectValue placeholder="Seleccionar socio..." /></SelectTrigger>
                            <SelectContent>
                                {partners.map(p => (<SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {selectedPartnerId && (
                        <TeacherPayroll mode="partner_income" partnerId={parseInt(selectedPartnerId, 10)} />
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );

  const PartnerView = () => {
    return (
    <Tabs defaultValue="studio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="studio">Finanzas del Estudio</TabsTrigger>
            <TabsTrigger value="personal">Mis Finanzas</TabsTrigger>
        </TabsList>
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
                    <CardHeader>
                         <CardTitle>Libro de Transacciones del Estudio</CardTitle>
                    </CardHeader>
                    <CardContent><IncomeExpenseLedger /></CardContent>
                </Card>
                <TeacherPayroll mode="studio_expenses" />
            </div>
        </TabsContent>
        <TabsContent value="personal" className="mt-6 space-y-8">
            <TeacherPayroll mode="partner_income" partnerId={userId} />
        </TabsContent>
    </Tabs>
  );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Panel de Finanzas</h1>
      </div>
        {userRole === 'admin' && <AdminView />}
        {userRole === 'socio' && <PartnerView />}
    </div>
  );
}

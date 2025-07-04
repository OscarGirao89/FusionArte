
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { users, membershipPlans } from '@/lib/data';
import type { StudentPayment } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Download, Edit, Printer, TrendingDown, TrendingUp, Wallet, PlusCircle, ArrowLeft } from 'lucide-react';
import { userProfiles } from '@/components/layout/main-nav';

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

export default function AdminPaymentsPage() {
  const { studentPayments: payments, addStudentPayment, updateStudentMembership, userRole } = useAuth();
  const [editingPayment, setEditingPayment] = useState<StudentPayment | null>(null);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
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

  const totals = payments.reduce((acc, p) => {
      acc.collected += p.amountPaid;
      acc.pending += p.amountDue;
      acc.total += p.totalAmount;
      return acc;
  }, { collected: 0, pending: 0, total: 0 });

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
    <div className="p-4 md:p-8">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-2 no-print">
        <div>
            <Button variant="ghost" onClick={() => router.push('/admin/finances')} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Finanzas
            </Button>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Pagos de Alumnos</h1>
        </div>
         {canCreate && (
            <Dialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen}>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Crear Factura</Button>
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
      </div>
      
      <div className="grid gap-4 md:grid-cols-3 mb-8 no-print">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobrado (Mes)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">€{totals.collected.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente de Cobro (Mes)</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{totals.pending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación Total (Mes)</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totals.total.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <CardTitle>Listado de Pagos</CardTitle>
                    <CardDescription>Gestiona los pagos de las membresías de los alumnos.</CardDescription>
                </div>
                 <div className="flex gap-2 flex-shrink-0 flex-wrap no-print">
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
    </div>
  );
}

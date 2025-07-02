
'use client';
import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { studentPayments, extraTransactions } from '@/lib/finances-data';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Paperclip, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const transactionFormSchema = z.object({
  type: z.enum(['ingreso', 'egreso'], { required_error: "Debes seleccionar un tipo." }),
  category: z.string().min(1, "La categoría es obligatoria."),
  description: z.string().min(3, "La descripción es obligatoria."),
  amount: z.coerce.number().positive("El monto debe ser un número positivo."),
  date: z.date({ required_error: "La fecha es obligatoria." }),
  receiptUrl: z.any().optional(), // No se validará el archivo en el prototipo
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export function IncomeExpenseLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>([...studentPayments, ...extraTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'egreso',
      category: '',
      description: '',
      amount: 0,
      date: new Date(),
    }
  });

  const onSubmit = (data: TransactionFormValues) => {
    const newTransaction: Transaction = {
      id: `trans-${Date.now()}`,
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
    };
    setTransactions([newTransaction, ...transactions]);
    toast({
      title: "Transacción añadida",
      description: "La transacción ha sido registrada exitosamente (simulación)."
    });
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Libro de Transacciones</CardTitle>
          <CardDescription>Registra y consulta todos los movimientos financieros.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Transacción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Nueva Transacción</DialogTitle>
              <DialogDescription>
                Registra un nuevo ingreso o egreso manualmente.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="ingreso">Ingreso</SelectItem>
                      <SelectItem value="egreso">Egreso</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Categoría</FormLabel><FormControl><Input {...field} placeholder="Ej: Suministros, Alquiler" /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Input {...field} placeholder="Ej: Compra de botellas de agua" /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel>Monto (€)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem><FormLabel>Fecha</FormLabel><FormControl><Input type="date" {...field} value={format(field.value, 'yyyy-MM-dd')} onChange={(e) => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="receiptUrl" render={({ field }) => (
                    <FormItem><FormLabel>Recibo (Opcional)</FormLabel><FormControl><Input type="file" {...field} /></FormControl><FormDescription>Adjunta una imagen o PDF del recibo.</FormDescription><FormMessage /></FormItem>
                )} />
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">Guardar Transacción</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto h-96">
            <Table>
            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((t) => (
                <TableRow key={t.id}>
                    <TableCell>
                        <div className="flex items-center gap-2">
                             {t.type === 'ingreso' 
                                ? <ArrowUpCircle className="h-5 w-5 text-green-500" />
                                : <ArrowDownCircle className="h-5 w-5 text-red-500" />
                             }
                            <div>
                                <p className="font-medium">{t.description}</p>
                                <p className="text-xs text-muted-foreground">{t.category} - {format(new Date(t.date), 'PPP', { locale: es })}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold ${t.type === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'ingreso' ? '+' : '-'}€{t.amount.toFixed(2)}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}

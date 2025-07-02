
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { membershipPlans as initialPlans, danceStyles } from '@/lib/data';
import type { MembershipPlan } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, PlusCircle, Pencil, Trash2, Ticket, InfinityIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const baseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "El título es obligatorio."),
  description: z.string().min(1, "La descripción es obligatoria."),
  price: z.coerce.number().min(0, "El precio debe ser un número positivo."),
  pricePeriod: z.string().min(1, "El período del precio es obligatorio."),
  features: z.string().min(10, "Añade al menos una característica."),
  isPopular: z.boolean().default(false),
});

const formSchema = z.discriminatedUnion("accessType", [
  z.object({
    accessType: z.literal("unlimited"),
    durationUnit: z.enum(['days', 'months']),
    durationValue: z.coerce.number().int().min(1, "La duración debe ser al menos 1."),
  }).merge(baseSchema),
  z.object({
    accessType: z.literal("pack_classes"),
    classCount: z.coerce.number().int().min(1, "El número de clases debe ser al menos 1."),
    allowedStyles: z.array(z.string()).optional(),
  }).merge(baseSchema),
  z.object({
    accessType: z.literal("trial_class")
  }).merge(baseSchema),
]);

type MembershipFormValues = z.infer<typeof formSchema>;

const planToForm = (plan: MembershipPlan): MembershipFormValues => {
  const common = {
    ...plan,
    features: plan.features.join('\n'),
  };
  switch (plan.accessType) {
    case 'unlimited':
      return { ...common, accessType: 'unlimited', durationUnit: plan.durationUnit || 'months', durationValue: plan.durationValue || 1 };
    case 'pack_classes':
      return { ...common, accessType: 'pack_classes', classCount: plan.classCount || 1, allowedStyles: plan.allowedStyles || [] };
    case 'trial_class':
      return { ...common, accessType: 'trial_class' };
    default:
      throw new Error("Invalid plan type");
  }
};

export default function AdminMembershipsPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>(initialPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const { toast } = useToast();

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accessType: 'unlimited',
      title: '',
      price: 0,
      pricePeriod: 'por mes',
      features: '',
      isPopular: false,
      durationUnit: 'months',
      durationValue: 1,
    },
  });

  const accessType = form.watch('accessType');

  const handleOpenDialog = (plan: MembershipPlan | null = null) => {
    setEditingPlan(plan);
    if (plan) {
      form.reset(planToForm(plan));
    } else {
      form.reset({
        accessType: 'unlimited',
        title: '',
        price: 0,
        pricePeriod: 'por mes',
        description: '',
        features: '',
        isPopular: false,
        durationUnit: 'months',
        durationValue: 1,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: MembershipFormValues) => {
    toast({
      title: `Plan ${editingPlan ? 'actualizado' : 'creado'} con éxito`,
      description: `El plan "${data.title}" ha sido guardado (simulación).`,
    });
    
    const planToSave: MembershipPlan = {
      ...data,
      features: data.features.split('\n').filter(f => f.trim() !== ''),
      id: editingPlan?.id || `plan-${Date.now()}`,
    };

    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? planToSave : p));
    } else {
      setPlans([...plans, planToSave]);
    }

    setIsDialogOpen(false);
    setEditingPlan(null);
  };
  
  const handleDelete = (planId: string) => {
    setPlans(plans.filter(p => p.id !== planId));
    toast({
      title: "Plan eliminado",
      description: `El plan ha sido eliminado (simulación).`,
      variant: "destructive"
    });
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Membresías</h1>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Plan
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Planes de Membresía</CardTitle>
          <CardDescription>Añade, edita o elimina los planes de membresía disponibles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead className="hidden sm:table-cell">Tipo de Acceso</TableHead>
                  <TableHead className="hidden md:table-cell">Precio</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <p className="font-medium">{plan.title}</p>
                      {plan.isPopular && <Badge variant="secondary" className="mt-1">Popular</Badge>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                        {plan.accessType === 'unlimited' ? <InfinityIcon className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
                        <span>
                            {
                                {
                                    'unlimited': 'Pase Ilimitado',
                                    'pack_classes': 'Paquete de Clases',
                                    'trial_class': 'Clase de Prueba'
                                }[plan.accessType]
                            }
                        </span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      ${plan.price} / {plan.pricePeriod}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Acciones</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(plan)}>
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                  </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Esta acción no se puede deshacer. Esto eliminará permanentemente el plan de membresía.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(plan.id)}>Eliminar</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Editar Plan' : 'Añadir Nuevo Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Modifica los detalles del plan.' : 'Rellena los detalles para crear un nuevo plan.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
               <FormField control={form.control} name="accessType" render={({ field }) => (
                  <FormItem><FormLabel>Tipo de Acceso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="unlimited">Pase Ilimitado</SelectItem>
                        <SelectItem value="pack_classes">Paquete de Clases</SelectItem>
                        <SelectItem value="trial_class">Clase de Prueba</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Título del Plan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descripción Corta</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Precio ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pricePeriod" render={({ field }) => (
                  <FormItem><FormLabel>Período</FormLabel><FormControl><Input placeholder="ej: por mes" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              {accessType === 'unlimited' && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-md">
                      <FormField control={form.control} name="durationValue" render={({ field }) => (
                          <FormItem><FormLabel>Duración</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="durationUnit" render={({ field }) => (
                          <FormItem><FormLabel>Unidad</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                  <SelectItem value="days">Días</SelectItem>
                                  <SelectItem value="months">Meses</SelectItem>
                              </SelectContent>
                          </Select><FormMessage /></FormItem>
                      )} />
                  </div>
              )}

              {accessType === 'pack_classes' && (
                  <div className="space-y-4 p-4 border rounded-md">
                     <FormField control={form.control} name="classCount" render={({ field }) => (
                          <FormItem><FormLabel>Cantidad de Clases</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField
                        control={form.control}
                        name="allowedStyles"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Estilos Permitidos</FormLabel>
                              <FormDescription>
                                Selecciona los estilos de baile a los que da acceso este pack. Deja todos sin marcar para permitir todos los estilos.
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                            {danceStyles.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="allowedStyles"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), item.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.name}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
              )}

              <FormField control={form.control} name="features" render={({ field }) => (
                <FormItem><FormLabel>Características (una por línea)</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="isPopular" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5">
                    <FormLabel>Marcar como Popular</FormLabel>
                </div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { membershipPlans as initialPlans, danceClasses } from '@/lib/data';
import type { MembershipPlan, CouponDetails } from '@/lib/types';

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
import { MoreHorizontal, PlusCircle, Pencil, Trash2, Ticket, InfinityIcon, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const couponSchema = z.object({
    code: z.string(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.coerce.number(),
    expirationDate: z.string().optional(),
    usageLimit: z.coerce.number().optional(),
}).optional().nullable();


const baseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "El título es obligatorio."),
  description: z.string().min(1, "La descripción es obligatoria."),
  price: z.coerce.number().min(0, "El precio debe ser un número positivo."),
  features: z.string().min(10, "Añade al menos una característica."),
  isPopular: z.boolean().default(false),
  durationUnit: z.enum(['days', 'weeks', 'months'], { required_error: "Debes seleccionar una unidad." }),
  durationValue: z.coerce.number().int().min(1, "La duración debe ser al menos 1."),
  visibility: z.enum(['public', 'unlisted']).default('public'),
  coupon: couponSchema,
});

const formSchema = z.discriminatedUnion("accessType", [
  z.object({ accessType: z.literal("unlimited") }).merge(baseSchema),
  z.object({
    accessType: z.literal("class_pack"),
    classCount: z.coerce.number().int().min(1, "El número de clases debe ser al menos 1."),
    allowedClasses: z.array(z.string()).default([]),
  }).merge(baseSchema),
  z.object({
    accessType: z.literal("trial_class"),
    classCount: z.coerce.number().int().min(1, "El número de clases debe ser al menos 1.").default(1),
    allowedClasses: z.array(z.string()).default([]),
  }).merge(baseSchema),
]);

type MembershipFormValues = z.infer<typeof formSchema>;

// Helper to convert plan data to form values
const planToForm = (plan: MembershipPlan): MembershipFormValues => {
  const common = {
    ...plan,
    features: plan.features.join('\n'),
    visibility: plan.visibility || 'public',
    coupon: plan.coupon ? { ...plan.coupon, expirationDate: plan.coupon.expirationDate || '', usageLimit: plan.coupon.usageLimit || undefined } : undefined,
  };
  switch (plan.accessType) {
    case 'unlimited':
      return { ...common, accessType: 'unlimited' };
    case 'class_pack':
      return { ...common, accessType: 'class_pack', allowedClasses: plan.allowedClasses || [] };
    case 'trial_class':
      return { ...common, accessType: 'trial_class', allowedClasses: plan.allowedClasses || [] };
  }
};

// Helper to format duration for display
const formatDuration = (value: number, unit: 'days' | 'weeks' | 'months') => {
  if (!value || !unit) return '';
  const labels = {
    days: { singular: 'día', plural: 'días' },
    weeks: { singular: 'semana', plural: 'semanas' },
    months: { singular: 'mes', plural: 'meses' },
  };
  const unitLabel = value === 1 ? labels[unit].singular : labels[unit].plural;
  return `${value} ${unitLabel}`;
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
      description: '',
      features: '',
      isPopular: false,
      durationUnit: 'months',
      durationValue: 1,
      visibility: 'public',
      coupon: undefined,
    },
  });

  const accessType = form.watch('accessType');
  const allClassIds = danceClasses.map(c => c.id);

  const handleOpenDialog = (plan: MembershipPlan | null = null) => {
    setEditingPlan(plan);
    if (plan) {
      form.reset(planToForm(plan));
    } else {
      form.reset({
        accessType: 'unlimited',
        title: '',
        price: 0,
        description: '',
        features: '',
        isPopular: false,
        durationUnit: 'months',
        durationValue: 1,
        classCount: 10,
        allowedClasses: [],
        visibility: 'public',
        coupon: undefined,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: MembershipFormValues) => {
    toast({
      title: `Plan ${editingPlan ? 'actualizado' : 'creado'} con éxito`,
      description: `El plan "${data.title}" ha sido guardado (simulación).`,
    });
    
    let planToSave: MembershipPlan;
    
    const couponData = data.coupon && data.coupon.code ? data.coupon : undefined;

    const commonData = {
        id: editingPlan?.id || `plan-${Date.now()}`,
        title: data.title,
        description: data.description,
        price: data.price,
        features: data.features.split('\n').filter(f => f.trim() !== ''),
        isPopular: data.isPopular,
        durationUnit: data.durationUnit,
        durationValue: data.durationValue,
        visibility: data.visibility,
        coupon: couponData as CouponDetails | undefined,
    };

    switch(data.accessType) {
        case 'unlimited':
            planToSave = { ...commonData, accessType: 'unlimited' };
            break;
        case 'class_pack':
            planToSave = { ...commonData, accessType: 'class_pack', classCount: data.classCount, allowedClasses: data.allowedClasses };
            break;
        case 'trial_class':
            planToSave = { ...commonData, accessType: 'trial_class', classCount: data.classCount, allowedClasses: data.allowedClasses };
            break;
    }

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
                  <TableHead className="hidden lg:table-cell">Visibilidad</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <p className="font-medium">{plan.title}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plan.isPopular && <Badge variant="secondary" className="mt-1">Popular</Badge>}
                        {plan.coupon && <Badge variant="destructive" className="mt-1 flex items-center gap-1"><Ticket className="h-3 w-3"/>{plan.coupon.code}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                        {plan.accessType === 'unlimited' ? <InfinityIcon className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
                        <span>
                            {
                                {
                                    'unlimited': 'Pase Ilimitado',
                                    'class_pack': 'Bono de Clases',
                                    'trial_class': 'Clase de Prueba'
                                }[plan.accessType]
                            }
                        </span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">€{plan.price}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                        <Badge variant={plan.visibility === 'public' ? 'default' : 'outline'}>
                            {plan.visibility === 'public' ? 'Público' : 'No Listado'}
                        </Badge>
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
                        <SelectItem value="class_pack">Bono de Clases</SelectItem>
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
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem><FormLabel>Precio (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="p-4 border rounded-md space-y-4">
                  <FormLabel>Validez del Plan</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="durationValue" render={({ field }) => (
                          <FormItem><FormLabel>Duración</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="durationUnit" render={({ field }) => (
                          <FormItem><FormLabel>Unidad</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                  <SelectItem value="days">Días</SelectItem>
                                  <SelectItem value="weeks">Semanas</SelectItem>
                                  <SelectItem value="months">Meses</SelectItem>
                              </SelectContent>
                          </Select><FormMessage /></FormItem>
                      )} />
                  </div>
              </div>


              {(accessType === 'class_pack' || accessType === 'trial_class') && (
                  <div className="space-y-4 p-4 border rounded-md">
                     <FormField control={form.control} name="classCount" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad de Clases</FormLabel>
                            <FormControl><Input type="number" min="1" {...field} /></FormControl>
                            <FormDescription>
                              {accessType === 'trial_class' ? 'Normalmente 1 para una clase de prueba.' : 'Número de clases incluidas en el bono.'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                      )} />
                      <FormField
                        control={form.control}
                        name="allowedClasses"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Clases Permitidas</FormLabel>
                              <FormDescription>
                                Selecciona las clases a las que da acceso este plan. Si no marcas ninguna, se permitirá el acceso a todas.
                              </FormDescription>
                            </div>
                            <ScrollArea className="h-40 rounded-md border p-4">
                            <div className="flex items-center space-x-2 mb-4">
                               <Checkbox
                                    id="select-all-classes"
                                    checked={form.watch('allowedClasses')?.length === allClassIds.length}
                                    onCheckedChange={(checked) => {
                                        form.setValue('allowedClasses', checked ? allClassIds : []);
                                    }}
                                />
                                <label htmlFor="select-all-classes" className="text-sm font-medium leading-none">
                                    Seleccionar todas
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {danceClasses.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="allowedClasses"
                                render={({ field }) => {
                                  // Ensure field.value is an array
                                  const fieldValue = Array.isArray(field.value) ? field.value : [];
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={fieldValue.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...fieldValue, item.id])
                                              : field.onChange(
                                                  fieldValue.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-sm">
                                        {item.name} ({item.day} - {item.time})
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                            </div>
                            </ScrollArea>
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
                    <FormDescription>Resalta este plan en la página de membresías.</FormDescription>
                </div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
              )} />
              
              <Collapsible className="space-y-4">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex items-center justify-start p-0 h-auto hover:bg-transparent">
                        <Settings className="mr-2 h-4 w-4" />
                        Configuración Avanzada
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4 border-t">
                    <FormField control={form.control} name="visibility" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Visibilidad del Plan</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="public">Público</SelectItem>
                                    <SelectItem value="unlisted">No Listado</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                "No Listado" oculta el plan de la página pública, pero puede ser asignado por un admin.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="p-4 border rounded-md space-y-4">
                        <h4 className="font-medium text-base">Cupón de Descuento (Opcional)</h4>
                        <FormField control={form.control} name="coupon.code" render={({ field }) => (
                          <FormItem><FormLabel>Código del Cupón</FormLabel><FormControl><Input {...field} placeholder="EJ: VERANO20" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="coupon.discountType" render={({ field }) => (
                                <FormItem><FormLabel>Tipo de Descuento</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                                        <SelectItem value="fixed">Monto Fijo (€)</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="coupon.discountValue" render={({ field }) => (
                                <FormItem><FormLabel>Valor</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <FormField control={form.control} name="coupon.expirationDate" render={({ field }) => (
                            <FormItem><FormLabel>Fecha de Caducidad</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="coupon.usageLimit" render={({ field }) => (
                            <FormItem><FormLabel>Límite de Usos</FormLabel><FormControl><Input type="number" min="1" {...field} placeholder="Ej: 15" /></FormControl><FormDescription>Dejar vacío para usos ilimitados.</FormDescription><FormMessage /></FormItem>
                        )} />
                    </div>
                </CollapsibleContent>
              </Collapsible>

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

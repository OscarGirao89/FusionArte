
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import type { MembershipPlan, DanceClass, PriceTier } from '@/lib/types';

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
import { MoreHorizontal, PlusCircle, Pencil, Trash2, TicketPercent, InfinityIcon, Settings, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { membershipPlanZodSchema } from '@/lib/types';


const formCompatibleSchema = membershipPlanZodSchema.extend({
    features: z.string().optional(),
});
type MembershipFormValues = z.infer<typeof formCompatibleSchema>;

// Helper to convert plan data from DB to a form-compatible format
const planToForm = (plan: MembershipPlan): MembershipFormValues => {
    const featuresAsString = Array.isArray(plan.features) ? plan.features.join('\n') : '';

    const baseData = {
        id: plan.id,
        title: plan.title,
        description: plan.description,
        features: featuresAsString,
        isPopular: plan.isPopular ?? false,
        durationUnit: plan.durationUnit,
        durationValue: plan.durationValue,
        visibility: plan.visibility || 'public',
        allowedClasses: plan.allowedClasses || [],
    };

    switch (plan.accessType) {
        case 'unlimited':
            return { ...baseData, accessType: 'unlimited', price: plan.price };
        case 'class_pack':
            return { ...baseData, accessType: 'class_pack', price: plan.price, classCount: plan.classCount };
        case 'trial_class':
            return { ...baseData, accessType: 'trial_class', price: plan.price, classCount: plan.classCount };
        case 'course_pass':
            return { ...baseData, accessType: 'course_pass', price: plan.price };
        case 'custom_pack':
            return { ...baseData, accessType: 'custom_pack', priceTiersJson: plan.priceTiersJson || [] };
        default:
             // Fallback for safety, though it shouldn't be reached with a discriminated union
            return { ...baseData, accessType: 'unlimited', price: 0 } as MembershipFormValues;
    }
};

export default function AdminMembershipsPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [danceClasses, setDanceClasses] = useState<DanceClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [plansRes, classesRes] = await Promise.all([
            fetch('/api/memberships'),
            fetch('/api/classes'),
        ]);
        if (plansRes.ok) setPlans(await plansRes.json());
        if (classesRes.ok) setDanceClasses(await classesRes.json());
    } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los datos." });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(formCompatibleSchema),
    defaultValues: {
      accessType: 'unlimited',
      title: '',
      price: 0,
      description: '',
      features: '',
      isPopular: false,
      durationUnit: 'months',
      durationValue: 1,
      allowedClasses: [],
      visibility: 'public',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "priceTiersJson",
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
        allowedClasses: [],
        visibility: 'public',
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: MembershipFormValues) => {
    const url = editingPlan ? `/api/memberships/${editingPlan.id}` : '/api/memberships';
    const method = editingPlan ? 'PUT' : 'POST';

    const planToSave = {
        ...data,
        features: typeof data.features === 'string' ? data.features.split('\n').filter(f => f.trim() !== '') : [],
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || `Failed to ${method} plan.`);
      }

      toast({
        title: `Plan ${editingPlan ? 'actualizado' : 'creado'} con éxito`,
        description: `El plan "${data.title}" ha sido guardado.`,
      });

      await fetchData();
    } catch (error) {
       toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsDialogOpen(false);
      setEditingPlan(null);
    }
  };
  
  const handleDelete = async (planId: string) => {
    try {
      const response = await fetch(`/api/memberships/${planId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete plan");

      toast({ title: "Plan eliminado", variant: "destructive" });
      await fetchData();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el plan.", variant: "destructive" });
    }
  }

  const allowedClassesDescription = (
    <>
      Si no marcas ninguna clase, se permitirá el acceso a todas las clases aplicables al tipo de plan. Si marcas una o más, el acceso se limitará solo a esas clases.
      {accessType === 'course_pass' && (
        <span className="font-bold block"> Es obligatorio seleccionar al menos una clase para este tipo de pase.</span>
      )}
    </>
  );

  if (isLoading) {
      return <div className="p-8"><Skeleton className="h-96 w-full" /></div>
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Gestión de Membresías</h1>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push('/admin/coupons')}>
              <TicketPercent className="mr-2 h-4 w-4" />
              Gestionar Cupones
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Plan
            </Button>
        </div>
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
                      {plan.isPopular && <Badge variant="secondary" className="mt-1">Popular</Badge>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                        {plan.accessType === 'unlimited' ? <InfinityIcon className="h-4 w-4" /> : <TicketPercent className="h-4 w-4" />}
                        <span>
                            { { 'unlimited': 'Pase Ilimitado', 'class_pack': 'Bono de Clases', 'trial_class': 'Clase de Prueba', 'course_pass': 'Pase por Curso', 'custom_pack': 'Bono Personalizado' }[plan.accessType] }
                        </span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {plan.accessType === 'custom_pack' ? `Desde €${(plan.priceTiersJson && plan.priceTiersJson.length > 0) ? plan.priceTiersJson[0].price : 0}` : `€${plan.price}`}
                    </TableCell>
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
                                      <AlertDialogDescription>Esta acción eliminará permanentemente el plan.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(plan.id!)}>Eliminar</AlertDialogAction>
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
                        <SelectItem value="unlimited">Pase Ilimitado / Por Curso</SelectItem>
                        <SelectItem value="class_pack">Bono de Clases</SelectItem>
                        <SelectItem value="custom_pack">Bono Personalizado</SelectItem>
                        <SelectItem value="trial_class">Clase de Prueba</SelectItem>
                        <SelectItem value="course_pass">Pase por Curso (Legado)</SelectItem>
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
              
              { (accessType === 'unlimited' || accessType === 'class_pack' || accessType === 'trial_class' || accessType === 'course_pass') && (
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Precio (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              )}
              
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
                               {accessType === 'trial_class' ? 'Normalmente 1.' : 'Número de clases incluidas.'}
                             </FormDescription>
                             <FormMessage />
                           </FormItem>
                       )} />
                  </div>
              )}

              <div className="space-y-4 p-4 border rounded-md">
                 <FormField
                   control={form.control} name="allowedClasses"
                   render={({ field }) => (
                     <FormItem>
                       <div className="mb-4">
                         <FormLabel className="text-base">Restringir Clases (Opcional)</FormLabel>
                         <FormDescription>{allowedClassesDescription}</FormDescription>
                       </div>
                       <ScrollArea className="h-40 rounded-md border p-4">
                       <div className="flex items-center space-x-2 mb-4">
                          <Checkbox id="select-all-classes" checked={form.watch('allowedClasses')?.length === allClassIds.length}
                               onCheckedChange={(checked) => form.setValue('allowedClasses', checked ? allClassIds : [])} />
                           <label htmlFor="select-all-classes" className="text-sm font-medium leading-none">Seleccionar todas</label>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {danceClasses.map((item) => (
                         <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                            <Checkbox checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                return checked ? field.onChange([...(field.value || []), item.id])
                                    : field.onChange((field.value || []).filter((v) => v !== item.id))
                                }} />
                            </FormControl>
                            <label htmlFor={`class-${item.id}`} className="font-normal text-sm">{item.name} ({item.day} - {item.time})</label>
                         </FormItem>
                       ))}
                       </div>
                       </ScrollArea>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
              </div>

              {accessType === 'custom_pack' && (
                <div className="space-y-4 p-4 border rounded-md">
                    <div>
                      <h3 className="font-medium mb-2">Tramos de Precios</h3>
                      <div className="space-y-3">
                        {fields.map((item, index) => (
                          <div key={item.id} className="flex items-end gap-3 p-2 border rounded-md">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                              <FormField control={form.control} name={`priceTiersJson.${index}.classCount`} render={({ field }) => ( <FormItem className="flex-1"><FormLabel>Nº Clases</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem> )} />
                              <FormField control={form.control} name={`priceTiersJson.${index}.price`} render={({ field }) => ( <FormItem className="flex-1"><FormLabel>Precio (€)</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}> <Trash2 className="h-4 w-4 text-destructive" /> </Button>
                          </div>
                        ))}
                      </div>
                      <Button type="button" size="sm" variant="outline" className="mt-4" onClick={() => append({ classCount: 8, price: 80 })}> <PlusCircle className="mr-2 h-4 w-4" /> Añadir Tramo </Button>
                       {form.formState.errors.priceTiersJson && (
                          <p className="text-sm font-medium text-destructive">{form.formState.errors.priceTiersJson.message}</p>
                        )}
                    </div>
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
              
              <Collapsible className="space-y-4">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full flex items-center justify-start p-0 h-auto hover:bg-transparent">
                        <Settings className="mr-2 h-4 w-4" />Configuración Avanzada
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4 border-t">
                    <FormField control={form.control} name="visibility" render={({ field }) => (
                        <FormItem><FormLabel>Visibilidad</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="public">Público</SelectItem>
                                    <SelectItem value="unlisted">No Listado</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>"No Listado" oculta el plan, pero puede ser asignado por un admin.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
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

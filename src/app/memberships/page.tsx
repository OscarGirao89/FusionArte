
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { membershipPlans } from '@/lib/data';
import type { MembershipPlan, StudentPayment, PriceTier } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { userProfiles } from '@/components/layout/main-nav';
import { ClassSelectorModal } from '@/components/shared/ClassSelectorModal';
import { CustomPackModal } from '@/components/shared/CustomPackModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LoginRequiredDialog } from '@/components/shared/login-required-dialog';
import Link from 'next/link';

const getPlanPriceDisplay = (plan: MembershipPlan) => {
  if (plan.accessType === 'unlimited' || plan.accessType === 'course_pass') {
    const unitMap = {
      days: plan.durationValue === 1 ? 'día' : 'días',
      weeks: plan.durationValue === 1 ? 'semana' : 'semanas',
      months: plan.durationValue === 1 ? 'mes' : 'meses',
    };
    return `/${plan.durationValue} ${unitMap[plan.durationUnit]}`;
  }
  if (plan.accessType === 'class_pack') {
    return ` / ${plan.classCount} clases`;
  }
  if (plan.accessType === 'custom_pack') {
    return `/ bono personalizable`;
  }
  return '/ pago único';
};

function PlanCard({ plan, onPurchaseRequest }: { plan: MembershipPlan, onPurchaseRequest: (plan: MembershipPlan) => void }) {
  return (
    <Card className={cn(
      "flex flex-col",
      plan.isPopular && "border-primary shadow-lg"
    )}>
      {plan.isPopular && (
        <div className="absolute -top-3 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Star className="h-3 w-3" />
          Popular
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">{plan.title}</CardTitle>
        <CardDescription>
          {plan.accessType === 'custom_pack' 
            ? <span className="text-4xl font-bold text-foreground">Desde €{plan.priceTiers[0].price}</span>
            : <span className="text-4xl font-bold text-foreground">€{plan.price}</span>
          }
          <span className="text-muted-foreground">{getPlanPriceDisplay(plan)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'} onClick={() => onPurchaseRequest(plan)}>
          {plan.accessType === 'custom_pack' ? 'Personalizar Bono' : 'Adquirir Plan'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function MembershipsPage() {
  const publicPlans = membershipPlans.filter(p => p.visibility === 'public');
  const { toast } = useToast();
  const { userRole, userId, isAuthenticated, addStudentPayment, updateStudentMembership } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isCustomPackOpen, setIsCustomPackOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [planToConfirm, setPlanToConfirm] = useState<MembershipPlan | null>(null);
  const [customPackConfig, setCustomPackConfig] = useState<{classCount: number; totalPrice: number;} | null>(null);
  const router = useRouter();


  const handlePurchaseRequest = (plan: MembershipPlan) => {
    if (!isAuthenticated) {
        setIsLoginDialogOpen(true);
        return;
    }
    if (userRole !== 'student') {
        toast({
            title: "Acción no permitida",
            description: "Solo los estudiantes pueden adquirir membresías.",
            variant: "destructive",
        });
        return;
    }
    
    setSelectedPlan(plan);

    if (plan.accessType === 'unlimited' || plan.accessType === 'course_pass') {
        setPlanToConfirm(plan);
    } else if (plan.accessType === 'custom_pack') {
        setIsCustomPackOpen(true);
    } else {
        setIsSelectorOpen(true);
    }
  };

  const handleConfirmUnlimitedPurchase = () => {
    if (!planToConfirm || userRole !== 'student' || !userId) return;

    const student = userProfiles[userRole];
    if (!student) return;

    const newPayment: StudentPayment = {
        id: `inv-${Date.now()}`,
        studentId: student.id,
        planId: planToConfirm.id,
        invoiceDate: new Date().toISOString(),
        totalAmount: planToConfirm.price,
        status: 'pending',
        amountPaid: 0,
        amountDue: planToConfirm.price,
        lastUpdatedBy: 'Sistema',
        lastUpdatedDate: new Date().toISOString(),
    };
    addStudentPayment(newPayment);

    const membershipEndDate = new Date();
    if (planToConfirm.durationUnit === 'months') {
        membershipEndDate.setMonth(membershipEndDate.getMonth() + planToConfirm.durationValue);
    } else if (planToConfirm.durationUnit === 'weeks') {
        membershipEndDate.setDate(membershipEndDate.getDate() + planToConfirm.durationValue * 7);
    } else { // days
        membershipEndDate.setDate(membershipEndDate.getDate() + planToConfirm.durationValue);
    }
    
    updateStudentMembership(student.id, {
        planId: planToConfirm.id,
        startDate: new Date().toISOString(),
        endDate: membershipEndDate.toISOString(),
    });
    
    toast({
        title: "Plan Adquirido",
        description: "Tu factura ha sido creada. Revisa la sección 'Mi Perfil' para ver los detalles.",
    });

    setPlanToConfirm(null);
    router.push('/profile');
  };

  const handleCustomPackTierSelected = (tier: PriceTier) => {
    if (!selectedPlan || selectedPlan.accessType !== 'custom_pack') return;

    setCustomPackConfig({
        classCount: tier.classCount,
        totalPrice: tier.price,
    });

    setIsCustomPackOpen(false);
    setIsSelectorOpen(true); // Open the class selector modal next
  };
  
  const handleConfirmSelection = (classIds: string[]) => {
     if (!selectedPlan || !userId) {
        toast({ title: "Error", description: "No se pudo procesar la compra.", variant: "destructive" });
        return;
     }

     const student = userProfiles[userRole!];
     let planToPurchase = selectedPlan;
     let finalPrice = selectedPlan.price;
     let finalClassCount: number | undefined;

     if (planToPurchase.accessType === 'class_pack' || planToPurchase.accessType === 'trial_class') {
        finalClassCount = planToPurchase.classCount;
     } else if (planToPurchase.accessType === 'custom_pack' && customPackConfig) {
        finalPrice = customPackConfig.totalPrice;
        finalClassCount = customPackConfig.classCount;
     }

     if (finalClassCount && classIds.length !== finalClassCount) {
         toast({ title: "Selección Incompleta", description: `Debes seleccionar exactamente ${finalClassCount} clases.`, variant: "destructive" });
         return;
     }

     const newPayment: StudentPayment = {
        id: `inv-${Date.now()}`,
        studentId: student.id,
        planId: planToPurchase.id,
        invoiceDate: new Date().toISOString(),
        totalAmount: finalPrice,
        status: 'pending',
        amountPaid: 0,
        amountDue: finalPrice,
        lastUpdatedBy: 'Sistema',
        lastUpdatedDate: new Date().toISOString(),
    };
    addStudentPayment(newPayment);

    const membershipEndDate = new Date();
    if (planToPurchase.durationUnit === 'months') {
      membershipEndDate.setMonth(membershipEndDate.getMonth() + planToPurchase.durationValue);
    } else if (planToPurchase.durationUnit === 'weeks') {
      membershipEndDate.setDate(membershipEndDate.getDate() + planToPurchase.durationValue * 7);
    } else { // days
      membershipEndDate.setDate(membershipEndDate.getDate() + planToPurchase.durationValue);
    }
    
    updateStudentMembership(student.id, {
        planId: planToPurchase.id,
        startDate: new Date().toISOString(),
        endDate: membershipEndDate.toISOString(),
        classesRemaining: finalClassCount,
    });
    
    console.log(`Enrolling student ${userId} in classes:`, classIds);

    setIsSelectorOpen(false);
    setSelectedPlan(null);
    setCustomPackConfig(null);
    toast({
        title: "¡Bono adquirido con éxito!",
        description: "Te has inscrito en las clases seleccionadas y se ha generado tu factura.",
    });
    router.push('/profile');
  };

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Nuestros Planes de Membresía</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para comenzar tu viaje en el baile con nosotros. Opciones flexibles para cada nivel y objetivo.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {publicPlans.map(plan => (
            <PlanCard key={plan.id} plan={plan} onPurchaseRequest={handlePurchaseRequest}/>
          ))}
          <Card className="flex flex-col border-dashed border-primary">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">Pase Mensual por Curso</CardTitle>
                <CardDescription>
                    <span className="text-muted-foreground">Suscríbete a tu clase favorita mensualmente.</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <ul className="space-y-3">
                    <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">Elige una clase recurrente del horario.</span>
                    </li>
                    <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">Acceso al plan mensual general "Ilimitado".</span>
                    </li>
                    <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">Cancela cuando quieras (simulado).</span>
                    </li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href="/schedule">Elegir Clase y Suscribir</Link>
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <LoginRequiredDialog isOpen={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen} />

      <AlertDialog open={!!planToConfirm} onOpenChange={(isOpen) => !isOpen && setPlanToConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Compra</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de adquirir el plan "{planToConfirm?.title}" por €{planToConfirm?.price}. Se generará una factura pendiente en tu perfil. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlanToConfirm(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmUnlimitedPurchase}>Confirmar y Adquirir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedPlan && (selectedPlan.accessType === 'class_pack' || selectedPlan.accessType === 'trial_class' || selectedPlan.accessType === 'custom_pack') && (
        <ClassSelectorModal
          plan={selectedPlan}
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          onConfirm={handleConfirmSelection}
          overrideClassCount={selectedPlan.accessType === 'custom_pack' ? customPackConfig?.classCount : undefined}
        />
      )}

      {selectedPlan && selectedPlan.accessType === 'custom_pack' && (
        <CustomPackModal
          plan={selectedPlan}
          isOpen={isCustomPackOpen}
          onClose={() => setIsCustomPackOpen(false)}
          onConfirm={handleCustomPackTierSelected}
        />
      )}
    </>
  );
}

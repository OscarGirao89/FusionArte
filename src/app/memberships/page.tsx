
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { MembershipPlan, StudentPayment, PriceTier } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { ClassSelectorModal } from '@/components/shared/ClassSelectorModal';
import { CustomPackModal } from '@/components/shared/CustomPackModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LoginRequiredDialog } from '@/components/shared/login-required-dialog';
import Link from 'next/link';
import { useSettings } from '@/context/settings-context';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

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
          {plan.accessType === 'custom_pack' && plan.priceTiersJson && plan.priceTiersJson.length > 0
            ? <span className="text-4xl font-bold text-foreground">Desde €{plan.priceTiersJson[0].price}</span>
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
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userRole, userId, isAuthenticated, currentUser, addStudentPayment, updateStudentMembership } = useAuth();
  const { settings } = useSettings();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isCustomPackOpen, setIsCustomPackOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [planToConfirm, setPlanToConfirm] = useState<MembershipPlan | null>(null);
  const [customPackConfig, setCustomPackConfig] = useState<{classCount: number; totalPrice: number;} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/memberships');
            if (res.ok) {
                const plansData: MembershipPlan[] = await res.json();
                setMembershipPlans(plansData.filter(p => p.visibility === 'public'));
            }
        } catch(e) {
            toast({ title: "Error", description: "No se pudieron cargar los planes." });
        } finally {
            setIsLoading(false);
        }
    };
    fetchPlans();
  }, [toast]);


  const handlePurchaseRequest = (plan: MembershipPlan) => {
    if (!isAuthenticated) {
        setIsLoginDialogOpen(true);
        return;
    }
    if (userRole !== 'student') {
        toast({ title: "Acción no permitida", description: "Solo los estudiantes pueden adquirir membresías.", variant: "destructive" });
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

  const processPurchase = async (planToPurchase: MembershipPlan, finalPrice: number, finalClassCount?: number) => {
    if (!currentUser) return;
    
    // In a real app, this would be an API call
    console.log(`Processing purchase for user ${currentUser.id}`, { planToPurchase, finalPrice, finalClassCount });
    
    toast({
        title: "¡Membresía adquirida con éxito!",
        description: "Se ha generado tu factura. Revisa tu perfil para más detalles.",
    });

    router.push('/profile');
  };

  const handleConfirmUnlimitedPurchase = () => {
    if (!planToConfirm) return;
    processPurchase(planToConfirm, planToConfirm.price);
    setPlanToConfirm(null);
  };
  
  const handleCustomPackTierSelected = (tier: PriceTier) => {
    if (!selectedPlan || selectedPlan.accessType !== 'custom_pack') return;

    setCustomPackConfig({ classCount: tier.classCount, totalPrice: tier.price });
    setIsCustomPackOpen(false);
    setIsSelectorOpen(true);
  };
  
  const handleConfirmSelection = (classIds: string[]) => {
     if (!selectedPlan || !userId) {
        toast({ title: "Error", description: "No se pudo procesar la compra.", variant: "destructive" });
        return;
     }

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

    processPurchase(planToPurchase, finalPrice, finalClassCount);
    setIsSelectorOpen(false);
    setSelectedPlan(null);
    setCustomPackConfig(null);
  };
  
  const coursePassPlan = membershipPlans.find(p => p.id === 'course-salsa-1');

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Nuestros Planes de Membresía</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para comenzar tu viaje en el baile con nosotros. Opciones flexibles para cada nivel y objetivo.
          </p>
        </div>

        {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[450px] w-full" />)}
            </div>
        ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {membershipPlans.map(plan => (
                <PlanCard key={plan.id} plan={plan} onPurchaseRequest={handlePurchaseRequest}/>
              ))}
              {coursePassPlan && (
                  <Card className="flex flex-col border-dashed border-primary">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-2xl">{coursePassPlan.title}</CardTitle>
                        <CardDescription>
                            <span className="text-muted-foreground">{coursePassPlan.description}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <ul className="space-y-3">
                            {coursePassPlan.features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                                    <span className="text-sm text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link href="/schedule">Elegir Clase y Suscribir</Link>
                        </Button>
                    </CardFooter>
                  </Card>
              )}
            </div>
        )}
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

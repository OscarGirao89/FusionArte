
'use client';

import { membershipPlans } from '@/lib/data';
import type { MembershipPlan } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const getPlanPriceDisplay = (plan: MembershipPlan) => {
  if (plan.accessType === 'unlimited') {
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
  return '/ pago único';
};

function PlanCard({ plan }: { plan: MembershipPlan }) {
  const router = useRouter();
  
  const getButtonInfo = () => {
    switch(plan.accessType) {
      case 'unlimited':
        return { text: 'Ver Horario y Elegir Clases', action: () => router.push('/schedule') };
      case 'class_pack':
        return { text: 'Ver Horario y Seleccionar Clases', action: () => router.push('/schedule') };
      default:
        return { text: 'Comprar Ahora', action: () => alert('Proceso de compra no implementado en este prototipo.') };
    }
  }

  const { text, action } = getButtonInfo();

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
          <span className="text-4xl font-bold text-foreground">€{plan.price}</span>
          <span className="text-muted-foreground">{getPlanPriceDisplay(plan)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {plan.coupon && (
            <div className="mb-4 text-center">
                <Badge variant="destructive" className="text-sm">
                    <Ticket className="mr-2 h-4 w-4" />
                    Cupón: {plan.coupon.code}
                </Badge>
            </div>
        )}
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
        <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'} onClick={action}>
          {text}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function MembershipsPage() {
  const publicPlans = membershipPlans.filter(p => p.visibility === 'public');

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Nuestros Planes de Membresía</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Elige el plan perfecto para comenzar tu viaje en el baile con nosotros. Opciones flexibles para cada nivel y objetivo.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {publicPlans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}

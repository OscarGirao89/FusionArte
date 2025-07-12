
'use client';
import { useState } from 'react';
import type { MembershipPlan, PriceTier } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Ticket } from 'lucide-react';
import { danceStyles } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

type CustomPackModalProps = {
    plan: MembershipPlan;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (tier: PriceTier) => void;
};

export function CustomPackModal({ plan, isOpen, onClose, onConfirm }: CustomPackModalProps) {
    if (plan.accessType !== 'custom_pack') {
        return null;
    }

    const [selectedTier, setSelectedTier] = useState<PriceTier | null>(null);
    const allowedStyleNames = plan.allowedStyles.map(styleId => danceStyles.find(s => s.id === styleId)?.name || styleId).join(', ');

    const handleConfirm = () => {
        if (selectedTier) {
            onConfirm(selectedTier);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-headline"><Ticket className="h-6 w-6" /> Personaliza tu Bono "{plan.title}"</DialogTitle>
                    <DialogDescription>
                        Elige una de las opciones disponibles para continuar. Válido para: {allowedStyleNames}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {plan.priceTiers.map(tier => (
                            <Card 
                                key={tier.classCount}
                                className={cn("cursor-pointer transition-all hover:shadow-lg", selectedTier?.classCount === tier.classCount && "border-primary ring-2 ring-primary")}
                                onClick={() => setSelectedTier(tier)}
                            >
                                <CardContent className="p-4 text-center">
                                    <p className="text-xl font-bold">{tier.classCount} Clases</p>
                                    <p className="text-2xl font-extrabold text-primary">€{tier.price.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        (€{(tier.price / tier.classCount).toFixed(2)} por clase)
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={!selectedTier}>
                        Elegir Clases
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


'use client';
import { useState, useMemo } from 'react';
import type { MembershipPlan } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Ticket, Minus, Plus } from 'lucide-react';
import { danceStyles } from '@/lib/data';

type CustomPackModalProps = {
    plan: MembershipPlan;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (plan: MembershipPlan, classCount: number, totalPrice: number) => void;
};

export function CustomPackModal({ plan, isOpen, onClose, onConfirm }: CustomPackModalProps) {
    if (plan.accessType !== 'custom_pack') {
        return null;
    }
    
    const [classCount, setClassCount] = useState(plan.minClasses);
    const totalPrice = useMemo(() => classCount * plan.pricePerClass, [classCount, plan.pricePerClass]);

    const allowedStyleNames = plan.allowedStyles.map(styleId => danceStyles.find(s => s.id === styleId)?.name || styleId).join(', ');

    const handleConfirm = () => {
        onConfirm(plan, classCount, totalPrice);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-headline"><Ticket className="h-6 w-6" /> Personaliza tu Bono "{plan.title}"</DialogTitle>
                    <DialogDescription>
                        Elige cuántas clases quieres y ve el precio al instante. Válido para: {allowedStyleNames}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-8">
                    <div className="space-y-4">
                        <Label htmlFor="class-count" className="text-center block">Número de Clases: <span className="font-bold text-lg text-primary">{classCount}</span></Label>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" onClick={() => setClassCount(v => Math.max(plan.minClasses, v - 1))} disabled={classCount <= plan.minClasses}>
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Slider
                                id="class-count"
                                min={plan.minClasses}
                                max={plan.maxClasses}
                                step={1}
                                value={[classCount]}
                                onValueChange={(value) => setClassCount(value[0])}
                            />
                            <Button variant="outline" size="icon" onClick={() => setClassCount(v => Math.min(plan.maxClasses, v + 1))} disabled={classCount >= plan.maxClasses}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-muted-foreground">Precio Total</p>
                        <p className="text-4xl font-bold">€{totalPrice.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">({classCount} clases x €{plan.pricePerClass}/clase)</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleConfirm}>
                        Confirmar y Pagar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


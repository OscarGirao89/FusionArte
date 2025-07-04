'use client';
import { useState, useMemo } from 'react';
import type { MembershipPlan } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { danceClasses as allClasses, danceLevels, danceStyles } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

type ClassSelectorModalProps = {
    plan: MembershipPlan;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (classIds: string[]) => void;
};

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function ClassSelectorModal({ plan, isOpen, onClose, onConfirm }: ClassSelectorModalProps) {
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

    const availableClasses = useMemo(() => {
        // This plan type check is for type safety, as unlimited plans shouldn't open this modal.
        if (plan.accessType === 'unlimited') return [];

        const eligibleClasses = (plan.allowedClasses && plan.allowedClasses.length > 0)
            ? allClasses.filter(c => plan.allowedClasses.includes(c.id))
            : allClasses;

        return eligibleClasses.filter(c => c.type !== 'rental' && !c.isCancelledAndHidden);
    }, [plan]);

    const handleSelectClass = (classId: string) => {
        // This should not happen based on current logic, but as a safeguard.
        if (plan.accessType === 'unlimited') return;

        setSelectedClasses(prev => {
            if (prev.includes(classId)) {
                return prev.filter(id => id !== classId);
            }
            if (prev.length < plan.classCount) {
                return [...prev, classId];
            }
            return prev;
        });
    };

    // classCount does not exist on unlimited plans, so we need to check the accessType.
    const classCount = plan.accessType !== 'unlimited' ? plan.classCount : 0;
    const classesLeftToSelect = classCount - selectedClasses.length;
    
    // The modal is only for plans with a specific class count.
    if (plan.accessType === 'unlimited') return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Selecciona tus Clases para el "{plan.title}"</DialogTitle>
                    <DialogDescription>
                        Puedes elegir {plan.classCount} {plan.classCount > 1 ? 'clases' : 'clase'}. 
                        <Badge variant="secondary" className="ml-2">
                           {classesLeftToSelect > 0 ? `${classesLeftToSelect} restante(s)` : '¡Listo!'}
                        </Badge>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <ScrollArea className="h-96">
                        {daysOfWeek.map(day => {
                            const classesForDay = availableClasses.filter(c => c.day === day);
                            if (classesForDay.length === 0) return null;

                            return (
                                <div key={day} className="mb-6">
                                    <h3 className="font-semibold mb-3 text-lg border-b pb-2">{day}</h3>
                                    <div className="space-y-4 pl-2">
                                        {classesForDay.map(c => (
                                            <div key={c.id} className="flex items-center space-x-3">
                                                <Checkbox 
                                                    id={`modal-${c.id}`} // Prefix to avoid duplicate IDs if main page has them
                                                    checked={selectedClasses.includes(c.id)}
                                                    onCheckedChange={() => handleSelectClass(c.id)}
                                                    disabled={!selectedClasses.includes(c.id) && selectedClasses.length >= plan.classCount}
                                                />
                                                <Label htmlFor={`modal-${c.id}`} className="flex flex-col cursor-pointer">
                                                    <span>{c.name} ({c.time})</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {danceStyles.find(s=>s.id === c.styleId)?.name} - {danceLevels.find(l=>l.id === c.levelId)?.name}
                                                        {c.type !== 'recurring' && c.date && ` - ${format(parseISO(c.date), 'dd/MM/yy', {locale: es})}`}
                                                    </span>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                         {availableClasses.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center pt-8">No hay clases disponibles para este plan.</p>
                         )}
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => onConfirm(selectedClasses)} disabled={classesLeftToSelect > 0}>
                        Confirmar Selección y Pagar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

'use client';
import { useState, useMemo } from 'react';
import type { MembershipPlan, DanceClass } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { danceClasses as allClasses, danceLevels, danceStyles } from '@/lib/data';
import { format, parseISO, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

type ClassSelectorModalProps = {
    plan: MembershipPlan;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (classIds: string[]) => void;
};

export function ClassSelectorModal({ plan, isOpen, onClose, onConfirm }: ClassSelectorModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

    const classesForDate = useMemo(() => {
        if (!selectedDate) return [];
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        return allClasses.filter(c => c.date === formattedDate && ['one-time', 'workshop'].includes(c.type));
    }, [selectedDate]);

    const handleSelectClass = (classId: string) => {
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
    
    const classesLeftToSelect = plan.classCount - selectedClasses.length;

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
                <div className="grid md:grid-cols-2 gap-6 py-4">
                    <div className="flex justify-center">
                         <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border"
                            locale={es}
                            disabled={(date) => isAfter(new Date(), date)}
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Clases para {selectedDate ? format(selectedDate, 'PPP', {locale: es}) : '...'}</h3>
                        <ScrollArea className="h-72 rounded-md border p-4">
                            {classesForDate.length > 0 ? (
                                <div className="space-y-4">
                                    {classesForDate.map(c => (
                                        <div key={c.id} className="flex items-center space-x-2">
                                            <Checkbox 
                                                id={c.id}
                                                checked={selectedClasses.includes(c.id)}
                                                onCheckedChange={() => handleSelectClass(c.id)}
                                                disabled={!selectedClasses.includes(c.id) && selectedClasses.length >= plan.classCount}
                                            />
                                            <Label htmlFor={c.id} className="flex flex-col">
                                                <span>{c.name} ({c.time})</span>
                                                <span className="text-xs text-muted-foreground">{danceStyles.find(s=>s.id === c.styleId)?.name} - {danceLevels.find(l=>l.id === c.levelId)?.name}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center pt-8">No hay clases programadas para este día. Por favor, elige otra fecha.</p>
                            )}
                        </ScrollArea>
                    </div>
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


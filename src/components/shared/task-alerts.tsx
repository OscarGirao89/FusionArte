
'use client';
import { useState, useEffect } from 'react';
import { taskNotes } from '@/lib/data';
import type { TaskNote } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format, parseISO, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

export function TaskAlerts() {
    const [upcomingAlerts, setUpcomingAlerts] = useState<TaskNote[]>([]);
    const [currentAlertIndex, setCurrentAlertIndex] = useState(0);

    useEffect(() => {
        // En una app real, esto podría ser una suscripción a notificaciones
        // Aquí simulamos la carga de tareas y la comprobación de alertas pendientes
        const now = new Date();
        const alertsToShow: TaskNote[] = [];

        taskNotes.forEach(task => {
            // Intenta obtener el estado de la alerta desde localStorage
            const isDismissed = localStorage.getItem(`alert_dismissed_${task.id}`) === 'true';

            if (task.alertDateTime && !task.alertDismissed && !isDismissed && isPast(parseISO(task.alertDateTime))) {
                alertsToShow.push(task);
            }
        });

        if (alertsToShow.length > 0) {
            setUpcomingAlerts(alertsToShow);
        }
    }, []);

    const handleDismiss = () => {
        // Avanza a la siguiente alerta o cierra el diálogo si no hay más
        if (currentAlertIndex < upcomingAlerts.length - 1) {
            setCurrentAlertIndex(prev => prev + 1);
        } else {
            setUpcomingAlerts([]);
            setCurrentAlertIndex(0);
        }
    };

    const handleDoNotShowAgain = () => {
        const currentTask = upcomingAlerts[currentAlertIndex];
        if (currentTask) {
            // Marca la alerta como descartada permanentemente (simulado con localStorage)
            try {
                localStorage.setItem(`alert_dismissed_${currentTask.id}`, 'true');
            } catch (error) {
                console.error("Could not access localStorage", error);
            }
            // Esto también podría actualizar el estado en una base de datos
            currentTask.alertDismissed = true; 
        }
        handleDismiss();
    };

    const currentAlert = upcomingAlerts[currentAlertIndex];

    if (!currentAlert) {
        return null;
    }

    return (
        <AlertDialog open={true} onOpenChange={handleDismiss}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¡Recordatorio de Tarea!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tienes una tarea pendiente: <strong className="text-foreground">{currentAlert.title}</strong>
                        {currentAlert.dueDate && (
                            <span> que vence el <strong>{format(parseISO(currentAlert.dueDate), 'PPP', { locale: es })}</strong>.</span>
                        )}
                        <p className="mt-2 text-sm">{currentAlert.description}</p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleDismiss}>Descartar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDoNotShowAgain}>
                        No volver a mostrar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

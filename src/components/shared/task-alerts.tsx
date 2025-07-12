
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
        // In a real app, this would be a subscription to notifcations
        // Here we simulate loading tasks and checking for pending alerts
        const now = new Date();
        const alertsToShow: TaskNote[] = [];

        taskNotes.forEach(task => {
            // Try to get the alert state from localStorage
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
        // Advances to the next alert or closes the dialog if there are no more
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
            // Mark the alert as permanently dismissed (simulated with localStorage)
            try {
                localStorage.setItem(`alert_dismissed_${currentTask.id}`, 'true');
            } catch (error) {
                console.error("Could not access localStorage", error);
            }
            // This could also update the state in a database
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
                        <div className="mt-2 text-sm">{currentAlert.description}</div>
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


import type { Transaction } from './types';

// Example income from student memberships
export const studentPayments: Transaction[] = [
    { id: 'payment-1', type: 'ingreso', category: 'Pago de Membresía', description: 'Ana López - Ilimitado Mensual', amount: 99, date: '2024-07-01' },
    { id: 'payment-2', type: 'ingreso', category: 'Pago de Membresía', description: 'Beatriz Sanz - Bono 10 Clases', amount: 120, date: '2024-07-03' },
    { id: 'payment-3', type: 'ingreso', category: 'Pago de Membresía', description: 'Marco Polo - Pase Principiante', amount: 75, date: '2024-07-04' },
    { id: 'payment-4', type: 'ingreso', category: 'Clase de Prueba', description: 'Clara Vidal', amount: 15, date: '2024-07-05' },
    { id: 'payment-5', type: 'ingreso', category: 'Pago de Membresía', description: 'Sofia Costa - Ilimitado Mensual', amount: 99, date: '2024-07-08' },
];

// Example other transactions (income and expenses)
export const extraTransactions: Transaction[] = [
    { id: 'extra-1', type: 'egreso', category: 'Alquiler', description: 'Alquiler Estudio - Julio', amount: 1500, date: '2024-07-05' },
    { id: 'extra-2', type: 'egreso', category: 'Suministros', description: 'Agua y toallas', amount: 75, date: '2024-07-10' },
    { id: 'extra-3', type: 'ingreso', category: 'Alquiler de Sala', description: 'Alquiler a grupo de teatro', amount: 200, date: '2024-07-12' },
    { id: 'extra-4', type: 'egreso', category: 'Marketing', description: 'Campaña en redes sociales', amount: 150, date: '2024-07-15' },
    { id: 'extra-5', type: 'egreso', category: 'Mantenimiento', description: 'Reparación de espejo', amount: 250, date: '2024-07-20' },
];

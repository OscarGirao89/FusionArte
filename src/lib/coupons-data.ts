
import type { Coupon } from './types';

export const coupons: Coupon[] = [
    {
        id: 'coupon-1',
        code: 'VERANO24',
        discountType: 'percentage',
        discountValue: 10,
        expirationDate: '2024-08-31',
        usageLimit: 50,
        status: 'active',
        applicableTo: 'all_memberships',
    },
    {
        id: 'coupon-2',
        code: 'NUEVOALUMNO',
        discountType: 'fixed',
        discountValue: 20,
        usageLimit: 100,
        status: 'active',
        applicableTo: 'specific_memberships',
        specificPlanIds: ['unlimited-1', 'pack-10'],
    },
    {
        id: 'coupon-3',
        code: 'TALLERHIPHOP',
        discountType: 'percentage',
        discountValue: 15,
        status: 'inactive',
        applicableTo: 'specific_classes',
        specificClassIds: ['clase-9'], // Assuming a hip-hop workshop might exist
    },
    {
        id: 'coupon-4',
        code: 'EXPIRADO',
        discountType: 'fixed',
        discountValue: 5,
        expirationDate: '2023-12-31',
        status: 'inactive',
        applicableTo: 'all_memberships',
    }
];

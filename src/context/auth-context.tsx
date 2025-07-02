
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudentMembership, StudentPayment } from '@/lib/types';
import { studentMemberships as initialMemberships } from '@/lib/data';
import { studentPayments as initialPayments } from '@/lib/finances-data';

export type UserRole = 'admin' | 'teacher' | 'student' | 'administrativo' | 'socio';

export interface AuthContextType {
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  studentMemberships: StudentMembership[];
  studentPayments: StudentPayment[];
  updateStudentMembership: (userId: number, membership: Omit<StudentMembership, 'userId'>) => void;
  addStudentPayment: (payment: StudentPayment, isUpdate?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentMemberships, setStudentMemberships] = useState<StudentMembership[]>(initialMemberships);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>(initialPayments);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole') as UserRole | null;
      if (storedRole) {
        setUserRole(storedRole);
      } else if (pathname !== '/login') {
         router.push('/login');
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
       if (pathname !== '/login') {
         router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (userRole && pathname === '/login') {
      router.push('/');
    }
  }, [userRole, pathname, router]);

  const login = (role: UserRole) => {
    try {
      localStorage.setItem('userRole', role);
      setUserRole(role);
      router.push('/');
    } catch (error) {
       console.error("Could not access localStorage", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('userRole');
      setUserRole(null);
      router.push('/login');
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
  };

  const updateStudentMembership = useCallback((userId: number, membership: Omit<StudentMembership, 'userId'>) => {
    setStudentMemberships(prev => {
        const existingIndex = prev.findIndex(m => m.userId === userId);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...membership };
            return updated;
        }
        return [...prev, { userId, ...membership }];
    });
  }, []);
  
  const addStudentPayment = useCallback((payment: StudentPayment, isUpdate = false) => {
      setStudentPayments(prev => {
          if (isUpdate) {
              return prev.map(p => p.id === payment.id ? payment : p);
          }
          // Avoid adding duplicates
          if (prev.some(p => p.id === payment.id)) {
              return prev;
          }
          return [payment, ...prev];
      })
  }, []);

  const value = {
    userRole,
    isAuthenticated: !!userRole,
    isLoading,
    login,
    logout,
    studentMemberships,
    studentPayments,
    updateStudentMembership,
    addStudentPayment,
  };
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Skeleton className="h-20 w-20 rounded-full" /></div>
  }

  if (!userRole && pathname !== '/login') {
    return null;
  }
  
  if (userRole && pathname === '/login') {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

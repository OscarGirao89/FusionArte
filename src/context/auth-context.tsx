
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudentMembership, StudentPayment, User } from '@/lib/types';
import { studentMemberships as initialMemberships, users as allUsers } from '@/lib/data';
import { studentPayments as initialPayments } from '@/lib/finances-data';
import { userProfiles } from '@/components/layout/main-nav';

export type UserRole = 'admin' | 'teacher' | 'student' | 'administrativo' | 'socio';

export interface AuthContextType {
  userRole: UserRole | null;
  userId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  studentMemberships: StudentMembership[];
  studentPayments: StudentPayment[];
  updateStudentMembership: (userId: number, membership: Omit<StudentMembership, 'userId'>) => void;
  addStudentPayment: (payment: StudentPayment, isUpdate?: boolean) => void;
  currentUser: User | null;
  updateCurrentUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicPaths = ['/login', '/', '/about', '/schedule', '/memberships', '/teachers', '/contact', '/register'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentMemberships, setStudentMemberships] = useState<StudentMembership[]>(initialMemberships);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>(initialPayments);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem('userRole') as UserRole | null;
      if (storedRole) {
        const userProfile = userProfiles[storedRole];
        const fullUser = allUsers.find(u => u.id === userProfile.id);
        setUserRole(storedRole);
        setUserId(userProfile?.id || null);
        setCurrentUser(fullUser || null);
      } else {
        // Allow unauthenticated access to public pages
        if (!publicPaths.includes(pathname) && !pathname.startsWith('/admin')) {
            // This condition is tricky. A better check would be !publicPaths.some(p => pathname.startsWith(p)) but for this app this is fine.
            // Let's assume admin paths are protected.
            if(publicPaths.includes(pathname)) {
              // it's fine
            } else {
               router.push('/login');
            }
        }
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
      if (!publicPaths.includes(pathname)) {
         router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!isLoading && !userRole && !publicPaths.includes(pathname)) {
        router.push('/login');
    }
  }, [userRole, pathname, router, isLoading]);


  const login = (role: UserRole) => {
    try {
      localStorage.setItem('userRole', role);
      const userProfile = userProfiles[role];
      const fullUser = allUsers.find(u => u.id === userProfile.id);
      setUserRole(role);
      setUserId(userProfile?.id || null);
      setCurrentUser(fullUser || null);
      // The redirect is now handled in the login page component
    } catch (error) {
       console.error("Could not access localStorage", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('userRole');
      setUserRole(null);
      setUserId(null);
      setCurrentUser(null);
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
          if (prev.some(p => p.id === payment.id)) {
              return prev;
          }
          return [payment, ...prev];
      })
  }, []);

  const updateCurrentUser = useCallback((data: Partial<User>) => {
    setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    // In a real app, you'd also persist this to the main user list/database
    const userIndex = allUsers.findIndex(u => u.id === currentUser?.id);
    if (userIndex > -1) {
        allUsers[userIndex] = { ...allUsers[userIndex], ...data };
    }
  }, [currentUser?.id]);

  const value = {
    userRole,
    userId,
    isAuthenticated: !!userRole,
    isLoading,
    login,
    logout,
    studentMemberships,
    studentPayments,
    updateStudentMembership,
    addStudentPayment,
    currentUser,
    updateCurrentUser,
  };
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Skeleton className="h-20 w-20 rounded-full" /></div>
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

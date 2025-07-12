
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudentMembership, StudentPayment, User } from '@/lib/types';
import { studentMemberships as initialMemberships, users as allUsers } from '@/lib/data';
import { studentPayments as initialPayments } from '@/lib/finances-data';
import { userProfiles } from '@/components/layout/main-nav';
import { useAttendance } from './attendance-context';

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

// Define which paths are public
const publicPaths = ['/login', '/', '/about', '/schedule', '/memberships', '/teachers', '/contact', '/register'];

// Define protected routes and their required roles
const protectedRoutes: { path: string; roles: UserRole[] }[] = [
  { path: '/admin/dashboard', roles: ['admin', 'socio', 'administrativo'] },
  { path: '/my-classes', roles: ['teacher', 'socio'] },
  { path: '/my-finances', roles: ['teacher', 'socio'] },
  { path: '/profile', roles: ['student', 'teacher', 'admin', 'administrativo', 'socio'] },
  { path: '/admin/finances', roles: ['admin', 'socio', 'administrativo']},
  { path: '/admin/payments', roles: ['admin', 'socio', 'administrativo']},
  { path: '/admin/settings', roles: ['admin', 'socio']},
  { path: '/admin/roles', roles: ['admin', 'socio']},
  { path: '/admin/users', roles: ['admin', 'socio', 'administrativo']},
  { path: '/admin/students', roles: ['admin', 'socio', 'administrativo']},
  { path: '/admin/classes', roles: ['admin', 'socio', 'administrativo']},
  { path: '/admin/memberships', roles: ['admin', 'socio', 'administrativo']},
  { path: '/admin/coupons', roles: ['admin', 'socio', 'administrativo']},
  { path: '/admin/levels', roles: ['admin', 'socio', 'administrativo']},
  { path: '/admin/styles', roles: ['admin', 'socio', 'administrativo']},
];

const checkAccess = (pathname: string, role: UserRole | null): { authorized: boolean; redirect?: string } => {
    // Check if the path is public. Note: a startsWith check for '/' would match everything.
    if (publicPaths.some(p => p === pathname || (p !== '/' && pathname.startsWith(p)))) {
        return { authorized: true };
    }

    if (!role) {
        // Not logged in, trying to access a non-public page
        return { authorized: false, redirect: '/login' };
    }
    
    // User is logged in, check protected routes. Find the most specific match first.
    const sortedRoutes = [...protectedRoutes].sort((a, b) => b.path.length - a.path.length);
    const routeConfig = sortedRoutes.find(route => pathname.startsWith(route.path));

    if (routeConfig) {
        if (routeConfig.roles.includes(role)) {
            // Role is authorized for this path
            return { authorized: true };
        } else {
            // Role is not authorized, redirect to their default page
            let defaultPath = '/profile';
            if (role === 'teacher' || role === 'socio') defaultPath = '/my-classes';
            if (role === 'admin' || role === 'administrativo') defaultPath = '/admin/dashboard';
            return { authorized: false, redirect: defaultPath };
        }
    }

    // If no specific protected route matched, but user is logged in, deny by default and send home.
    return { authorized: false, redirect: '/' };
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentMemberships, setStudentMemberships] = useState<StudentMembership[]>(initialMemberships);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>(initialPayments);
  const { resetAttendance } = useAttendance();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true); // Start loading on every path change
    let storedRole: UserRole | null = null;
    try {
        storedRole = localStorage.getItem('userRole') as UserRole | null;
    } catch (e) {
        console.error("Could not access localStorage", e);
    }

    const { authorized, redirect } = checkAccess(pathname, storedRole);

    if (authorized) {
        if (storedRole && (!currentUser || storedRole !== userRole)) {
            const userProfile = userProfiles[storedRole];
            const fullUser = allUsers.find(u => u.id === userProfile.id);
            setUserRole(storedRole);
            setUserId(userProfile?.id || null);
            setCurrentUser(fullUser || null);
        }
        setIsLoading(false);
    } else {
        if (redirect === '/login' && pathname !== '/login') {
            try {
              localStorage.setItem('redirectPath', pathname);
            } catch (error) {
              console.error("Could not access localStorage", error);
            }
        }
        router.replace(redirect || '/login');
        // Keep loading=true until redirection happens and the new page is authorized.
    }
  }, [pathname, router, currentUser, userRole]);


  const login = (role: UserRole) => {
    try {
      localStorage.setItem('userRole', role);
      const userProfile = userProfiles[role];
      const fullUser = allUsers.find(u => u.id === userProfile.id);
      
      setIsLoading(true); // Set loading while we re-evaluate access
      setUserRole(role);
      setUserId(userProfile?.id || null);
      setCurrentUser(fullUser || null);
      
      const redirectPath = localStorage.getItem('redirectPath');
      localStorage.removeItem('redirectPath');

      // The useEffect will handle the redirection after the state is updated
      if (redirectPath && redirectPath !== '/login') {
        router.push(redirectPath);
      } else {
         if (role === 'student') {
            router.push('/profile');
          } else if (role === 'teacher' || role === 'socio') {
            router.push('/my-classes');
          } else {
            router.push('/admin/dashboard'); // Redirect all management roles to the dashboard
          }
      }
    } catch (error) {
       console.error("Could not access localStorage", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('userRole');
      setIsLoading(true); // Set loading while we re-evaluate access
      setUserRole(null);
      setUserId(null);
      setCurrentUser(null);
      resetAttendance(); // Clear attendance data on logout
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

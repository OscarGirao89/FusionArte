
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudentMembership, StudentPayment, User } from '@/lib/types';
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

const publicPaths = ['/login', '/', '/about', '/schedule', '/memberships', '/teachers', '/contact', '/register'];

const protectedRoutes: { path: string; roles: UserRole[] }[] = [
  { path: '/admin', roles: ['admin', 'socio', 'administrativo'] },
  { path: '/my-classes', roles: ['teacher', 'socio'] },
  { path: '/my-finances', roles: ['teacher', 'socio'] },
  { path: '/profile', roles: ['student', 'teacher', 'admin', 'administrativo', 'socio'] },
];

const checkAccess = (pathname: string, role: UserRole | null): { authorized: boolean; redirect?: string } => {
    if (publicPaths.some(p => p === pathname || (p !== '/' && pathname.startsWith(p)))) {
        return { authorized: true };
    }

    if (!role) {
        return { authorized: false, redirect: '/login' };
    }
    
    const sortedRoutes = [...protectedRoutes].sort((a, b) => b.path.length - a.path.length);
    const routeConfig = sortedRoutes.find(route => pathname.startsWith(route.path));

    if (routeConfig) {
        if (routeConfig.roles.includes(role)) {
            return { authorized: true };
        } else {
            let defaultPath = '/profile';
            if (role === 'teacher' || role === 'socio') defaultPath = '/my-classes';
            if (role === 'admin' || role === 'administrativo') defaultPath = '/admin/dashboard';
            return { authorized: false, redirect: defaultPath };
        }
    }

    return { authorized: false, redirect: '/' };
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentMemberships, setStudentMemberships] = useState<StudentMembership[]>([]);
  const [studentPayments, setStudentPayments] = useState<StudentPayment[]>([]);
  const { resetAttendance } = useAttendance();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthStatus = async () => {
        let storedRole: UserRole | null = null;
        try {
            storedRole = localStorage.getItem('userRole') as UserRole | null;
        } catch (e) {
            console.error("Could not access localStorage", e);
        }

        const { authorized, redirect } = checkAccess(pathname, storedRole);

        if (!authorized) {
            if (redirect === '/login' && pathname !== '/login') {
                try {
                    localStorage.setItem('redirectPath', pathname);
                } catch (error) {
                    console.error("Could not access localStorage", error);
                }
            }
            router.replace(redirect || '/login');
            setIsLoading(false);
            return;
        }

        if (storedRole) {
            if (!currentUser || storedRole !== userRole) {
                // This part is for simulation, in a real app you'd fetch user data
                const userProfile = userProfiles[storedRole];
                // This is a placeholder, a real app would fetch from DB
                const placeholderUser: User = { 
                    id: userProfile.id, 
                    name: userProfile.name, 
                    email: 'user@example.com',
                    role: 'Estudiante', // a default
                    joined: new Date().toISOString(),
                    avatar: userProfile.avatar,
                    specialties: []
                 };
                setUserRole(storedRole);
                setUserId(userProfile?.id || null);
                setCurrentUser(placeholderUser);
            }
        }
        setIsLoading(false);
    };

    checkAuthStatus().catch(err => {
        console.error("Auth check failed, redirecting to login.", err);
        setUserRole(null);
        setCurrentUser(null);
        setIsLoading(false);
        if(!publicPaths.includes(pathname)) {
            router.replace('/login');
        }
    });
  }, [pathname, router, currentUser, userRole]);


  const login = (role: UserRole) => {
    try {
      localStorage.setItem('userRole', role);
      // In a real app, you would fetch user data after login
      // For now, we continue with placeholder data
      const userProfile = userProfiles[role];
      const placeholderUser: User = { 
        id: userProfile.id, 
        name: userProfile.name, 
        email: 'user@example.com',
        role: 'Estudiante',
        joined: new Date().toISOString(),
        avatar: userProfile.avatar,
        specialties: []
      };

      setIsLoading(true);
      setUserRole(role);
      setUserId(userProfile?.id || null);
      setCurrentUser(placeholderUser);
      
      const redirectPath = localStorage.getItem('redirectPath');
      localStorage.removeItem('redirectPath');

      if (redirectPath && redirectPath !== '/login') {
        router.push(redirectPath);
      } else {
         if (role === 'student') {
            router.push('/profile');
          } else if (role === 'teacher') {
            router.push('/my-classes');
          } else {
            router.push('/admin/dashboard');
          }
      }
    } catch (error) {
       console.error("Could not access localStorage", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('userRole');
      setIsLoading(true);
      setUserRole(null);
      setUserId(null);
      setCurrentUser(null);
      resetAttendance();
      router.push('/login');
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
  };

  const updateStudentMembership = useCallback((userId: number, membership: Omit<StudentMembership, 'userId'>) => {
    // This would be an API call in a real app
    console.log("Updating membership for", userId, membership);
  }, []);
  
  const addStudentPayment = useCallback((payment: StudentPayment, isUpdate = false) => {
      // This would be an API call in a real app
      console.log("Adding/updating payment", payment);
  }, []);

  const updateCurrentUser = useCallback((data: Partial<User>) => {
    // This would be an API call in a real app
    setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

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

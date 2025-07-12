
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import type { StudentMembership, StudentPayment, User } from '@/lib/types';
import { useAttendance } from './attendance-context';

export type UserRole = 'admin' | 'teacher' | 'student' | 'administrativo' | 'socio';

export interface AuthContextType {
  userRole: UserRole | null;
  userId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
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

const userMap: Record<UserRole, number> = {
    student: 1,
    teacher: 10,
    admin: 4,
    administrativo: 7,
    socio: 2,
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
                const currentId = userMap[storedRole];
                try {
                    const res = await fetch(`/api/users`);
                    if(res.ok) {
                        const users = await res.json();
                        const user = users.find((u: User) => u.id === currentId);
                        setCurrentUser(user);
                    }
                } catch (e) { console.error(e) }

                setUserRole(storedRole);
                setUserId(currentId || null);
            }
        }
        setIsLoading(false);
    };

    checkAuthStatus().catch(err => {
        console.error("Auth check failed, redirecting to login.", err);
        setUserRole(null); setCurrentUser(null); setIsLoading(false);
        if(!publicPaths.includes(pathname)) { router.replace('/login'); }
    });
  }, [pathname, router, currentUser, userRole]);


  const login = async (role: UserRole) => {
    try {
      localStorage.setItem('userRole', role);
      setIsLoading(true);
      setUserRole(role);
      const currentId = userMap[role];
      setUserId(currentId);

      try {
        const res = await fetch(`/api/users`);
        if(res.ok) {
            const users = await res.json();
            const user = users.find((u:User) => u.id === currentId);
            setCurrentUser(user);
        }
      } catch (e) { console.error(e); }

      const redirectPath = localStorage.getItem('redirectPath');
      localStorage.removeItem('redirectPath');

      if (redirectPath && redirectPath !== '/login') {
        router.push(redirectPath);
      } else {
         if (role === 'student') router.push('/profile');
         else if (role === 'teacher' || role === 'socio') router.push('/my-classes');
         else router.push('/admin/dashboard');
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

  const updateCurrentUser = useCallback((data: Partial<User>) => {
    // This would be an API call in a real app
    setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const value = {
    userRole, userId, isAuthenticated: !!userRole,
    isLoading, login, logout, currentUser, updateCurrentUser,
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

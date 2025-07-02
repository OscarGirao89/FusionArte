
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export type UserRole = 'admin' | 'teacher' | 'student' | 'administrativo' | 'socio';

export interface AuthContextType {
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    // This effect handles redirecting a logged-in user away from the login page.
    // It runs after the component renders, avoiding the "cannot update during render" error.
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

  const value = {
    userRole,
    isAuthenticated: !!userRole,
    isLoading,
    login,
    logout,
  };
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Skeleton className="h-20 w-20 rounded-full" /></div>
  }

  // Prevent rendering children if a redirect is imminent.
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

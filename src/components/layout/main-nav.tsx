'use client';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarSeparator,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Users,
  LogOut,
  Flame,
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useSidebar } from '@/components/ui/sidebar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schedule', label: 'Horario de Clases', icon: Calendar },
  { href: '/memberships', label: 'Membresías', icon: CreditCard },
  { href: '/teachers', label: 'Profesores', icon: Users },
];

const adminNavItems = [
    { href: '/admin/users', label: 'Gestión de Usuarios', icon: Users },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

// Simulamos un rol de administrador para mostrar las opciones.
const userRole = 'admin';


export function MainNav() {
  const pathname = usePathname();
  const { open, isMobile } = useSidebar();
  
  const logo = (
    <div className="flex items-center gap-2" aria-hidden="true">
        <Flame className="h-8 w-8 text-primary" />
        <span className="font-bold text-lg font-headline">FusionArte</span>
    </div>
  )

  return (
    <>
      <SidebarHeader className="h-14 justify-between">
        {open || isMobile ? logo : <Link href="/">{logo}</Link>}
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={{ children: item.label }}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}

        {userRole === 'admin' && (
            <>
                <SidebarSeparator className="my-2"/>
                <SidebarGroup>
                    <SidebarGroupLabel>Administración</SidebarGroupLabel>
                    {adminNavItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          tooltip={{ children: item.label }}
                        >
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarGroup>
            </>
        )}
      </SidebarMenu>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Cerrar Sesión' }}>
                <LogOut />
                <span>Cerrar Sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="flex items-center gap-3 p-2">
            <Avatar>
              <AvatarImage src="https://placehold.co/100x100.png" alt="Admin" data-ai-hint="person face" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-sidebar-foreground">
                Admin
              </span>
              <span className="text-sidebar-foreground/70">Administrador/a</span>
            </div>
          </div>
        </SidebarGroup>
      </SidebarFooter>
    </>
  );
}


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
  Settings,
  BookMarked,
  User,
  ClipboardList,
  ClipboardCheck,
  DollarSign,
  Banknote,
  GraduationCap,
  ShieldCheck,
  Wallet,
  TicketPercent,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth, UserRole } from '@/context/auth-context';
import { users } from '@/lib/data';
import { LogoIcon } from '@/components/icons/logo-icon';


const navItems = {
  student: [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'Mi Perfil', icon: User },
    { href: '/schedule', label: 'Horario de Clases', icon: Calendar },
    { href: '/memberships', label: 'Membresías', icon: CreditCard },
    { href: '/teachers', label: 'Profesores', icon: Users },
  ],
  teacher: [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/schedule', label: 'Horario General', icon: Calendar },
    { href: '/my-classes', label: 'Mis Clases', icon: BookMarked },
  ],
  admin: [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/schedule', label: 'Horario de Clases', icon: Calendar },
    { href: '/memberships', label: 'Membresías', icon: CreditCard },
    { href: '/teachers', label: 'Profesores', icon: Users },
  ],
  administrativo: [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/payments', label: 'Pagos de Alumnos', icon: Wallet },
  ],
  socio: [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/schedule', label: 'Horario de Clases', icon: Calendar },
    { href: '/memberships', label: 'Membresías', icon: CreditCard },
    { href: '/teachers', label: 'Profesores', icon: Users },
  ],
};

const adminNavItems = [
    { href: '/admin/users', label: 'Gestión de Usuarios', icon: User },
    { href: '/admin/students', label: 'Gestión de Alumnos', icon: GraduationCap },
    { href: '/admin/classes', label: 'Gestión de Clases', icon: ClipboardList },
    { href: '/admin/memberships', label: 'Gestión de Membresías', icon: CreditCard },
    { href: '/admin/finances', label: 'Finanzas', icon: Banknote },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

export const userProfiles: Record<UserRole, { id: number; name: string; role: string; avatar: string }> = {
    student: { id: 1, name: 'Ana López', role: 'Estudiante', avatar: 'https://placehold.co/100x100.png?text=AL' },
    teacher: { id: 2, name: 'Oscar Girao', role: 'Profesor', avatar: 'https://placehold.co/100x100.png?text=OG' },
    admin: { id: 4, name: 'Admin FusionArte', role: 'Administrador/a', avatar: 'https://placehold.co/100x100.png?text=AF' },
    administrativo: { id: 7, name: 'Laura Martinez', role: 'Recepción', avatar: 'https://placehold.co/100x100.png?text=LM' },
    socio: { id: 2, name: 'Oscar Girao', role: 'Socio', avatar: 'https://placehold.co/100x100.png?text=OG' },
};


export function MainNav() {
  const pathname = usePathname();
  const { open, isMobile } = useSidebar();
  const { userRole, logout } = useAuth();

  const currentNavItems = userRole ? navItems[userRole] : [];
  const currentUser = userRole ? userProfiles[userRole] : null;
  
  const logo = (
    <div className="flex items-center gap-2" aria-hidden="true">
        <LogoIcon className="h-8 w-8 text-primary" />
        <span className="font-bold text-lg font-headline">FusionArte</span>
    </div>
  )

  return (
    <>
      <SidebarHeader className="h-14 justify-between no-print">
        {open || isMobile ? logo : <Link href="/">{logo}</Link>}
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2 no-print">
        {currentNavItems.map((item) => (
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

        {(userRole === 'admin' || userRole === 'socio') && (
            <>
                <SidebarSeparator className="my-2"/>
                <SidebarGroup>
                    <SidebarGroupLabel>Administración</SidebarGroupLabel>
                    {adminNavItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname.startsWith(item.href)}
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

      <SidebarFooter className="no-print">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout} tooltip={{ children: 'Cerrar Sesión' }}>
                <LogOut />
                <span>Cerrar Sesión</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {currentUser && (
            <div className="flex items-center gap-3 p-2">
                <Avatar>
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint="person face" />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm group-data-[collapsible=icon]:hidden">
                <span className="font-semibold text-sidebar-foreground">
                    {currentUser.name}
                </span>
                <span className="text-sidebar-foreground/70">{currentUser.role}</span>
                </div>
            </div>
          )}
        </SidebarGroup>
      </SidebarFooter>
    </>
  );
}


'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth, UserRole } from '@/context/auth-context';
import { LogoIcon } from '@/components/icons/logo-icon';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { Settings, BookMarked, User, LogOut, ChevronDown, CreditCard, Calendar, Users, ClipboardList, Banknote, GraduationCap, Wallet, Home, BarChart2, Ticket, BarChart, LayoutDashboard, HandCoins } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useSettings } from '@/context/settings-context';
import Image from 'next/image';

const publicNav = [
    { href: '/', label: 'Inicio' },
    { href: '/about', label: 'Acerca de Nosotros' },
    { href: '/schedule', label: 'Clases / Horarios' },
    { href: '/memberships', label: 'Membresías' },
    { href: '/teachers', label: 'Profesores' },
    { href: '/contact', label: 'Contacto' },
];

const adminManagementNav = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Usuarios', icon: User },
    { href: '/admin/students', label: 'Alumnos', icon: GraduationCap },
    { href: '/admin/classes', label: 'Clases', icon: ClipboardList },
    { href: '/admin/memberships', label: 'Membresías', icon: CreditCard },
    { href: '/admin/coupons', label: 'Cupones', icon: Ticket },
    { href: '/admin/finances', label: 'Finanzas', icon: Banknote },
    { href: '/admin/settings', label: 'Configuración', icon: Settings },
];

export const userProfiles: Record<UserRole, { id: number; name: string; role: string; avatar: string }> = {
    student: { id: 1, name: 'Ana López', role: 'Estudiante', avatar: 'https://placehold.co/100x100.png?text=AL' },
    teacher: { id: 10, name: 'Alexandra', role: 'Profesor/a', avatar: 'https://placehold.co/100x100.png?text=A' },
    admin: { id: 4, name: 'Admin FusionArte', role: 'Administrador/a', avatar: 'https://placehold.co/100x100.png?text=AF' },
    administrativo: { id: 7, name: 'Laura Martinez', role: 'Recepción', avatar: 'https://placehold.co/100x100.png?text=LM' },
    socio: { id: 2, name: 'Oscar Girao', role: 'Socio', avatar: 'https://placehold.co/100x100.png?text=OG' },
};

function UserMenu() {
    const { userRole, logout, currentUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    if (!currentUser) return null;

    const managementRoles: UserRole[] = ['admin', 'socio', 'administrativo'];
    const canManage = userRole && managementRoles.includes(userRole);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback>{currentUser.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                    <p className="font-bold">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">{currentUser.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push('/profile')}><User className="mr-2 h-4 w-4"/> Mi Perfil</DropdownMenuItem>
                    {(userRole === 'teacher' || userRole === 'socio') && (
                        <>
                            <DropdownMenuItem onClick={() => router.push('/my-classes')}><ClipboardList className="mr-2 h-4 w-4"/>Mis Clases</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/my-finances')}><HandCoins className="mr-2 h-4 w-4"/>Mis Finanzas</DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuGroup>
                 {canManage && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Gestión</span>
                            </DropdownMenuSubTrigger>
                             <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {adminManagementNav.map((item) => (
                                        <DropdownMenuItem key={item.href} asChild>
                                            <Link href={item.href} className={cn("flex items-center gap-2", pathname.startsWith(item.href) && "text-primary")}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                             </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </>
                 )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
    </DropdownMenu>
    )
}

function NavLinks() {
    const pathname = usePathname();
    return (
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            {publicNav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn('text-sm font-medium transition-colors hover:text-primary',
                    pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)) ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
            ))}
        </nav>
    );
}

function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                    {publicNav.map((link) => (
                        <SheetClose asChild key={link.href}>
                            <Link href={link.href} className="text-lg font-medium hover:text-primary flex items-center gap-2">
                               {link.label}
                            </Link>
                        </SheetClose>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    );
}

export function MainNav() {
    const { settings } = useSettings();
  
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 mr-6">
            {settings.logoUrl ? (
                <Image src={settings.logoUrl} alt={settings.academyName} width={40} height={40} className="h-8 w-auto" />
            ) : (
                <LogoIcon className="h-8 w-8 text-primary" />
            )}
            <span className="hidden sm:inline-block font-bold text-lg font-headline">{settings.academyName}</span>
          </Link>
          <div className="flex-1">
              <NavLinks />
          </div>
          <div className="flex items-center gap-2">
              <UserMenu />
              <MobileNav />
          </div>
        </div>
      </header>
    );
}

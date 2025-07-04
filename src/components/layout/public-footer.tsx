import Link from 'next/link';
import { LogoIcon } from '@/components/icons/logo-icon';

export function PublicFooter() {
  return (
    <footer className="bg-muted py-8 border-t">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <div className="flex justify-center items-center gap-2 mb-4">
            <LogoIcon className="h-8 w-8 text-primary" />
            <span className="font-bold text-lg font-headline text-foreground">FusionArte</span>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} FusionArte. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

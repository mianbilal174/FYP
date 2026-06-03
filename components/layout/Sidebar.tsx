'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Home, Settings, AlertCircle, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/alerts', label: 'Alerts', icon: AlertCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border border-t-0 bg-sidebar hidden md:flex md:flex-col z-50" style={{ borderTop: 'none' }}>
      <Link href="/" className="flex items-center gap-3 px-6 pt-6 pb-8" style={{ borderTop: 'none', borderBottom: 'none' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Leaf className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold">Smart Crop</span>
          <span className="text-xs text-muted-foreground">Irrigation System</span>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-2 px-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border pt-4 px-6 pb-6">
        <p className="text-xs text-sidebar-foreground/60">Smart Crop Irrigation System</p>
      </div>
    </aside>
  );
}

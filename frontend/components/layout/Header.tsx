// frontend/components/layout/Header.tsx
'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, Bell } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { useMemo } from 'react';

export function Header() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  // Determine page title based on the route
  const pageTitle = useMemo(() => {
    if (pathname === '/users') return 'Users';
    if (pathname.startsWith('/users/add')) return 'Add User';
    if (pathname.match(/^\/users\/.+\/edit$/)) return 'Edit User';
    if (pathname.match(/^\/users\/.+/)) return 'User Details';
    if (pathname === '/settings') return 'Settings';
    return 'Dashboard';
  }, [pathname]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shrink-0">
      <div className="flex items-center">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden -ml-2 mr-2 text-slate-500 hover:text-slate-700"
          onClick={toggleSidebar}
        >
          <Menu className="w-6 h-6" />
        </Button>
        {/* Page Title */}
        <h1 id="page-title" className="text-xl font-semibold text-slate-800">
          {pageTitle}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="p-2 text-slate-400 hover:text-slate-600 relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </Button>
      </div>
    </header>
  );
}

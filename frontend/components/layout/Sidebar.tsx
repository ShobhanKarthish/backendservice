// frontend/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutGrid, Users, UserPlus, Settings } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();

  const navItems = [
    {
      href: '/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/users/add', // This link makes the "Add User" button active on the add page
      label: 'Add User',
      icon: UserPlus,
    },
  ];

  const systemItems = [
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  // Close sidebar on mobile nav click
  const handleLinkClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-slate-900/50 z-20 lg:hidden transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={cn(
          'fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30 transform transition-transform duration-300 flex flex-col h-full',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 text-white font-bold">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">AdminUI</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // Make active state more specific for "Users" vs "Users/add"
            const isActive =
              item.href === '/users'
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Button
                key={item.label}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start text-sm font-medium',
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600'
                )}
                onClick={handleLinkClick}
              >
                <Link href={item.href}>
                  <item.icon
                    className={cn(
                      'w-5 h-5 mr-3',
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
                    )}
                  />
                  {item.label}
                </Link>
              </Button>
            );
          })}

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              System
            </p>
          </div>

          {systemItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Button
                key={item.label}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start text-sm font-medium',
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600'
                )}
                onClick={handleLinkClick}
              >
                <Link href={item.href}>
                  <item.icon
                    className={cn(
                      'w-5 h-5 mr-3',
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
                    )}
                  />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* User Snippet Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center">
            <Avatar className="w-9 h-9">
              <AvatarImage src="https://ui-avatars.com/api/?name=Admin+User&background=indigo&color=fff" />
              <AvatarFallback>AU</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-700">Admin User</p>
              <p className="text-xs text-slate-500">admin@example.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

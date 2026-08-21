import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/notifications', label: 'Notifications', icon: '🔔' },
  { href: '/packages', label: 'Packages', icon: '📦' },
  { href: '/devices', label: 'Devices', icon: '📱' },
  { href: '/builds', label: 'Builds', icon: '🔨' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">NetConect</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {session.user?.email}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-accent transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <form
            action={async () => {
              'use server';
              redirect('/login');
            }}
          >
            <button
              type="button"
              onClick={() => fetch('/api/auth/signout', { method: 'POST' }).then(() => window.location.href = '/login')}
              className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

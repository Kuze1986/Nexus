import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Package, Newspaper, HelpCircle, Users } from 'lucide-react';
import { useNexusAuth } from '@/hooks/useNexusAuth';
import { supabase } from '@/api/supabaseClient';

export default function AdminLayout({ children, activePage }) {
  const navigate = useNavigate();
  const { isLoadingAuth, isAuthenticated, isAdmin, isSuperAdmin } = useNexusAuth();

  useEffect(() => {
    if (isLoadingAuth) {
      return;
    }
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.href);
      navigate(`${createPageUrl('login')}?redirect_to=${returnUrl}`);
      return;
    }
    if (!isAdmin && !isSuperAdmin) {
      navigate(createPageUrl('Home'));
    }
  }, [isAdmin, isAuthenticated, isLoadingAuth, isSuperAdmin, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(createPageUrl('login'));
  };

  if (isLoadingAuth || !isAuthenticated || (!isAdmin && !isSuperAdmin)) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { label: 'Demo Requests', icon: LayoutDashboard, page: 'AdminDashboard' },
    { label: 'Portfolio', icon: Package, page: 'AdminPortfolio' },
    { label: 'Press', icon: Newspaper, page: 'AdminPress' },
    { label: 'FAQ', icon: HelpCircle, page: 'AdminFAQ' },
    { label: 'Team', icon: Users, page: 'AdminTeam' }
  ];

  return (
    <div className="min-h-screen bg-[#080C14]">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white/5 backdrop-blur-sm border-r border-white/10 p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">NEXUS</h1>
            <p className="text-sm text-gray-400">Admin Portal</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-white/10">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
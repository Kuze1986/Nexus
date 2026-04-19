import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { Bell, Menu, X, LayoutDashboard, Users, FileBarChart, Shield, GraduationCap, BarChart3, Receipt, Settings, LifeBuoy, UserCog, Building2, FileText, MessageSquare, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [institutionUser, setInstitutionUser] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Find InstitutionUser record
      const instUsers = await base44.entities.InstitutionUser.filter({ email: currentUser.email });
      if (instUsers.length > 0) {
        const instUser = instUsers[0];
        setInstitutionUser(instUser);

        // Load institution if not super admin
        if (instUser.role !== 'nexus_super_admin' && instUser.institution_id) {
          const inst = await base44.entities.Institution.filter({ id: instUser.institution_id });
          if (inst.length > 0) {
            setInstitution(inst[0]);
            // Load licenses
            const lics = await base44.entities.LicenseRecord.filter({ institution_id: instUser.institution_id });
            setLicenses(lics);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = institutionUser?.role === 'admin';
  const isSuperAdmin = institutionUser?.role === 'nexus_super_admin';
  const hasProduct = (product) => licenses.some(l => l.product === product || l.product === 'both');
  const hasMeridian = hasProduct('meridian');
  const hasLumora = hasProduct('lumora');
  const hasBoth = licenses.some(l => l.product === 'both');

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Super Admin navigation
  const superAdminNav = [
    { name: 'Institution Manager', path: 'AdminInstitutions', icon: Building2 },
    { name: 'License Manager', path: 'AdminLicenses', icon: FileText },
    { name: 'User Manager', path: 'AdminUsers', icon: UserCog },
    { name: 'Announcements', path: 'AdminAnnouncements', icon: BellRing },
    { name: 'Support Queue', path: 'AdminSupport', icon: MessageSquare },
    { name: 'Audit Log', path: 'AdminAuditLog', icon: FileBarChart },
  ];

  // Client navigation
  const clientNav = [
    { name: 'Dashboard', path: 'Dashboard', icon: LayoutDashboard, show: true },
    { name: 'Enrollment & Seats', path: 'Enrollment', icon: Users, show: true },
    { name: 'Compliance', path: 'Compliance', icon: Shield, show: hasMeridian && !hasBoth },
    { name: 'Learner Progress', path: 'Progress', icon: GraduationCap, show: hasLumora && !hasBoth },
    { name: 'Combined View', path: 'Combined', icon: BarChart3, show: hasBoth },
    { name: 'Reports', path: 'Reports', icon: FileBarChart, show: true },
    { name: 'License & Billing', path: 'License', icon: Receipt, show: true },
    { name: 'Team Management', path: 'Team', icon: UserCog, show: isAdmin },
    { name: 'Support', path: 'Support', icon: LifeBuoy, show: true },
    { name: 'Settings', path: 'Settings', icon: Settings, show: true },
  ].filter(item => item.show);

  const navigation = isSuperAdmin ? superAdminNav : clientNav;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 hover:text-gray-700 lg:hidden"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            {institution && (
              <div className="flex items-center gap-3">
                {institution.logo_url && (
                  <img src={institution.logo_url} alt={institution.name} className="h-10 w-10 object-contain" />
                )}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{institution.name}</h1>
                </div>
              </div>
            )}
            {isSuperAdmin && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#0F172A] rounded flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">NEXUS Admin</h1>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
              <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-gray-700">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] transition-all duration-300",
          sidebarOpen ? "w-64" : "w-0 lg:w-20",
          "lg:block"
        )}>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.path;
              return (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#0F172A] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-73px)]">
          <div className="p-6 pb-20">
            {children}
          </div>
          
          {/* Footer */}
          <footer className="border-t border-gray-700 bg-[#0F172A] py-4 px-6">
            <p className="text-center text-xs text-gray-400">
              Nexus Client Portal — Powered by NEXUS Holdings — Confidential.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
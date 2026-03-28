import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  UserCircle,
} from 'lucide-react';
import type { Role } from '../../types';

/* ── Role nav configs ──────────────────────────────────────────────────── */
const roleLinks: Record<
  NonNullable<Role>,
  { name: string; path: string; icon: React.ElementType }[]
> = {
  woman: [
    { name: 'Dashboard',     path: '/dashboard/woman',        icon: LayoutDashboard },
    { name: 'Opportunities', path: '/dashboard/opportunities', icon: Briefcase },
    { name: 'Mentorship',    path: '/dashboard/mentorship',   icon: Users },
    { name: 'Tests',         path: '/dashboard/tests',        icon: BookOpen },
    { name: 'Messages',      path: '/dashboard/messages',     icon: MessageSquare },
    { name: 'Profile',       path: '/dashboard/profile',      icon: UserCircle },
  ],
  mentor: [
    { name: 'Dashboard',  path: '/dashboard/mentor',      icon: LayoutDashboard },
    { name: 'Mentorship', path: '/dashboard/mentorship',  icon: CheckCircle },
    { name: 'Messages',   path: '/dashboard/messages',    icon: MessageSquare },
    { name: 'Profile',    path: '/dashboard/profile',     icon: UserCircle },
  ],
  sponsor: [
    { name: 'Dashboard',     path: '/dashboard/sponsor',       icon: LayoutDashboard },
    { name: 'Opportunities', path: '/dashboard/opportunities',  icon: Briefcase },
    { name: 'Messages',      path: '/dashboard/messages',       icon: MessageSquare },
    { name: 'Profile',       path: '/dashboard/profile',        icon: UserCircle },
  ],
  admin: [
    { name: 'Dashboard',     path: '/dashboard/admin',          icon: LayoutDashboard },
    { name: 'Opportunities', path: '/dashboard/opportunities',  icon: Briefcase },
    { name: 'Mentorship',    path: '/dashboard/mentorship',     icon: Users },
    { name: 'Tests',         path: '/dashboard/tests',          icon: BookOpen },
    { name: 'Profile',       path: '/dashboard/profile',        icon: UserCircle },
  ],
};

/* ── Role visual config ────────────────────────────────────────────────── */
const roleStyle: Record<
  NonNullable<Role>,
  { gradient: string; activeText: string; activeBg: string; badge: string; label: string; icon: string }
> = {
  woman:   { gradient: 'from-violet-600 to-purple-600', activeText: 'text-violet-700',  activeBg: 'bg-violet-50',   badge: 'bg-violet-100 text-violet-700',  label: 'Women Portal',   icon: '👩‍💻' },
  mentor:  { gradient: 'from-teal-600 to-cyan-600',    activeText: 'text-teal-700',    activeBg: 'bg-teal-50',     badge: 'bg-teal-100 text-teal-700',      label: 'Mentor Portal',  icon: '🎓' },
  sponsor: { gradient: 'from-amber-500 to-orange-500', activeText: 'text-amber-700',   activeBg: 'bg-amber-50',    badge: 'bg-amber-100 text-amber-700',    label: 'Sponsor Portal', icon: '🏢' },
  admin:   { gradient: 'from-gray-700 to-slate-700',   activeText: 'text-gray-800',    activeBg: 'bg-gray-100',    badge: 'bg-gray-200 text-gray-700',      label: 'Admin Portal',   icon: '🛡️' },
};

export const Sidebar = ({ role }: { role: Role }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const links = role ? roleLinks[role] : [];
  const style = role ? roleStyle[role] : roleStyle.woman;

  return (
    <aside
      className={`bg-white border-r border-gray-100 hidden md:flex flex-col transition-all duration-300 shadow-xs ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`h-16 flex items-center justify-between px-4 border-b border-gray-100 shrink-0 bg-gradient-to-r ${style.gradient}`}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{style.icon}</span>
            <h1 className="text-sm font-black text-white truncate">EmpowHerHub</h1>
          </div>
        )}
        {collapsed && <span className="text-xl mx-auto">{style.icon}</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors ml-auto shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && role && (
        <div className="px-4 pt-4 pb-1">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${style.badge}`}>
            <span>{style.icon}</span>
            {style.label}
          </span>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon    = link.icon;
          const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');

          return (
            <Link
              key={link.name}
              to={link.path}
              title={collapsed ? link.name : undefined}
              className={`flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                isActive
                  ? `${style.activeBg} ${style.activeText} shadow-xs`
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              } ${collapsed ? 'justify-center' : 'gap-3'}`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${isActive ? style.activeText : 'text-gray-400'}`}
              />
              {!collapsed && <span>{link.name}</span>}
              {!collapsed && isActive && (
                <span className={`ml-auto h-1.5 w-1.5 rounded-full bg-current opacity-60`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom role indicator */}
      {!collapsed && (
        <div className={`p-3 border-t border-gray-100`}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${style.gradient} text-white/90`}>
            <span className="text-base">{style.icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Signed in as</p>
              <p className="text-xs font-bold truncate capitalize">{role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

import React, { useState, useEffect } from 'react';
import { Bell, User as UserIcon, LogOut } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types';

const roleConfig: Record<NonNullable<Role>, { label: string; badge: string }> = {
  woman:   { label: 'Women Portal',   badge: 'bg-violet-100 text-violet-700 border border-violet-200' },
  mentor:  { label: 'Mentor Portal',  badge: 'bg-teal-100 text-teal-700 border border-teal-200'       },
  sponsor: { label: 'Sponsor Portal', badge: 'bg-amber-100 text-amber-700 border border-amber-200'    },
  admin:   { label: 'Admin Portal',   badge: 'bg-gray-100 text-gray-700 border border-gray-200'       },
};

export const Topbar = ({ role, onLogout }: { role: Role; onLogout: () => void }) => {
  const cfg = role ? roleConfig[role] : null;
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = user?.sub || user?.id;
      if (!userId || !role) return;

      try {
        const res = await api.get(`/users/${userId}/notifications/${role}`);
        if (typeof res.data === 'number') {
           setNotificationCount(res.data);
        } else if (res.data?.count !== undefined) {
           setNotificationCount(res.data.count);
        } else {
           setNotificationCount(Number(res.data));
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
    
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user, role]);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-xs">
      <div className="flex items-center gap-3">
        {cfg && (
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${cfg.badge}`}>
            {cfg.label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Unread count */}
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20 transition-colors">
          <UserIcon className="h-5 w-5" />
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="h-9 w-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

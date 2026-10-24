import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import {
  Home,
  FileText,
  CreditCard,
  AlertTriangle,
  Bell,
  MessageSquare
} from 'lucide-react';

export const BottomNav = () => {
  const { t } = useTranslation();
  const { unreadCount } = useApp();

  const navItems = [
    { path: '/', label: t('nav.home'), icon: Home },
    { path: '/bills', label: t('nav.bills'), icon: FileText },
    { path: '/payments', label: t('nav.payments'), icon: CreditCard },
    { path: '/outages', label: t('nav.outages'), icon: AlertTriangle },
    { path: '/updates', label: t('nav.updates'), icon: Bell, badge: unreadCount },
    { path: '/assistant', label: t('nav.assistant'), icon: MessageSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors relative ${
                  isActive
                    ? 'text-teal-600 dark:text-teal-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] leading-tight truncate max-w-[50px] text-center">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

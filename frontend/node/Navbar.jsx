import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import { SUPPORTED_LANGUAGES } from '../i18n';
import {
  Zap,
  Droplets,
  Globe,
  Bell,
  Sun,
  Moon,
  UserCheck,
  ChevronDown,
  Sparkles,
  WifiOff,
  Search,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const {
    currentUser,
    userData,
    allUsers,
    switchUser,
    utility,
    setUtility,
    health,
    darkMode,
    setDarkMode,
  } = useApp();
  const { unreadCount: notifUnreadCount, setPanelOpen } = useNotifications();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [moreLangModalOpen, setMoreLangModalOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setLangDropdownOpen(false);
    setMoreLangModalOpen(false);
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.englishName.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Logo & Tagline */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {t('app.name')}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-medium">
                      సరళ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block leading-tight">
                    {t('app.tagline')}
                  </p>
                </div>
              </Link>

              {/* Offline / AI Status Pill */}
              <div className="hidden lg:flex items-center">
                {health.mode === 'ai_online' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    {t('app.ai_badge')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800" title="Running deterministic rule-based engine offline">
                    <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                    {t('app.offline_badge')}
                  </span>
                )}
              </div>
            </div>

            {/* Center Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { path: '/', label: t('nav.home') },
                { path: '/bills', label: t('nav.bills') },
                { path: '/payments', label: t('nav.payments') },
                { path: '/outages', label: t('nav.outages') },
                { path: '/updates', label: t('nav.updates') },
                { path: '/assistant', label: t('nav.assistant') },
              ].map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Controls & Selectors */}
            <div className="flex items-center gap-2">
              
              {/* Utility Switcher (Electricity ⚡ / Water 💧) */}
              <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setUtility('electricity')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    utility === 'electricity'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                  title="Switch to Electricity utility"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('app.electricity')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUtility('water')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    utility === 'water'
                      ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                  title="Switch to Water utility"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('app.water')}</span>
                </button>
              </div>

              {/* Demo User Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setLangDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  title="Switch Demo User (Lakshmi / Ravi)"
                >
                  <UserCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="max-w-[70px] sm:max-w-none truncate font-semibold">
                    {userData?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-fade-in">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {t('app.switch_user')}
                    </div>
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50 dark:hover:bg-slate-700 ${
                          currentUser === u.id
                            ? 'font-bold text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-slate-700/50'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {u.city} • {u.primary_utility === 'electricity' ? '⚡ High Electric' : '💧 Water Issues'}
                          </div>
                        </div>
                        {currentUser === u.id && <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setLangDropdownOpen(!langDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  title="Switch Language"
                >
                  <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="font-medium">{currentLangObj.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 max-h-80 overflow-y-auto animate-fade-in">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {t('app.select_language')}
                    </div>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleLanguageChange(l.code)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50 dark:hover:bg-slate-700 ${
                          i18n.language === l.code
                            ? 'font-bold text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-slate-700/50'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-semibold">{l.name}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5">({l.englishName})</span>
                        </div>
                        {i18n.language === l.code && <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
                      </button>
                    ))}
                    <div className="border-t border-slate-200 dark:border-slate-700 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setLangDropdownOpen(false);
                          setMoreLangModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-700 flex items-center gap-1.5"
                      >
                        <Search className="w-3.5 h-3.5" />
                        {t('app.more_languages')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications Bell with Unread Badge */}
              <button
                type="button"
                onClick={() => setPanelOpen(true)}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={t('notifications.title') || 'Notifications'}
              >
                <Bell className="w-4 h-4" />
                {notifUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
                  </span>
                )}
              </button>

              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* More Languages Search Modal */}
      {moreLangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-5 overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-500" />
                {t('app.more_languages')}
              </h3>
              <button
                onClick={() => setMoreLangModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search language (e.g. Telugu, Hindi, French, Spanish)..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="mt-4 max-h-60 overflow-y-auto space-y-1">
                {filteredLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code)}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">{l.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({l.englishName})</span>
                    </div>
                    {i18n.language === l.code && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium">
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

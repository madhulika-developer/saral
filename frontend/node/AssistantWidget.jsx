import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, Sparkles, X } from 'lucide-react';
import { AssistantChat } from './AssistantChat';

export const AssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // If user is already on the dedicated /assistant page, hide the floating widget
  if (location.pathname === '/assistant') {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50">
      {isOpen ? (
        <div className="animate-scale-up origin-bottom-right">
          <AssistantChat isFloating={true} onClose={() => setIsOpen(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 text-white shadow-xl shadow-teal-600/30 transition-all transform hover:scale-105 active:scale-95 border border-teal-500/30"
          title="Open Saral AI Assistant"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 fill-white/20" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:inline">
            Ask Saral
          </span>
        </button>
      )}
    </div>
  );
};

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AssistantWidget } from './components/AssistantWidget';
import { ErrorBoundary } from './components/ErrorBoundary';

import { HomeDashboard } from './pages/HomeDashboard';
import { BillExplainer } from './pages/BillExplainer';
import { PaymentTracker } from './pages/PaymentTracker';
import { OutagesPage } from './pages/OutagesPage';
import { UpdatesFeed } from './pages/UpdatesFeed';
import { AssistantPage } from './pages/AssistantPage';

import { NotificationPreferencesPage } from './pages/NotificationPreferencesPage';
import { NotificationPanel } from './components/NotificationPanel';
import { ChannelPreviewModal } from './components/ChannelPreviewModal';
import { MockSmsInboxModal } from './components/MockSmsInboxModal';
import { WhileOfflineSummaryModal } from './components/WhileOfflineSummaryModal';
import { DemoControls } from './components/DemoControls';

export const App = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16 md:pb-0">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/bills" element={<BillExplainer />} />
            <Route path="/payments" element={<PaymentTracker />} />
            <Route path="/outages" element={<OutagesPage />} />
            <Route path="/updates" element={<UpdatesFeed />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/preferences" element={<NotificationPreferencesPage />} />
          </Routes>
        </main>

        <NotificationPanel />
        <ChannelPreviewModal />
        <MockSmsInboxModal />
        <WhileOfflineSummaryModal />
        <DemoControls />

        <AssistantWidget />
        <BottomNav />
      </div>
    </ErrorBoundary>
  );
};

export default App;

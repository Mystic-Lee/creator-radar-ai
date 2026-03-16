import React from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout }             from './components/Layout';
import { Onboarding }         from './components/Onboarding';
import { Dashboard }          from './pages/Dashboard';
import { Leads }              from './pages/Leads';
import { AddEditLead }        from './pages/AddEditLead';
import { CreatorReviewPanel } from './pages/CreatorReviewPanel';
import { CreatorDiscovery }   from './pages/CreatorDiscovery';
import { PriorityQueue }      from './pages/PriorityQueue';
import { Campaigns }          from './pages/Campaigns';
import { DmGenerator }        from './pages/DmGenerator';
import { ExportPage }         from './pages/ExportPage';
import { RisingCreators }     from './pages/RisingCreators';
import { QuickReview }        from './pages/QuickReview';
import { Reports }            from './pages/Reports';
import { Settings }           from './pages/Settings';
import { HelpGuide }          from './pages/HelpGuide';

function AppRoutes() {
  const { onboardingComplete, isLoading } = useApp();
  if (isLoading) return <div className="app-loading"><div className="loading-spinner"/><p>Loading CreatorRadar AI…</p></div>;
  if (!onboardingComplete) return <Onboarding />;
  return (
    <Layout>
      <Routes>
        <Route path="/"               element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/discovery"      element={<CreatorDiscovery />} />
        <Route path="/leads"          element={<Leads />} />
        <Route path="/leads/new"      element={<AddEditLead onSave={async()=>{}} onCancel={()=>{}} />} />
        <Route path="/leads/:id"      element={<CreatorReviewPanel />} />
        <Route path="/rising"         element={<RisingCreators />} />
        <Route path="/quick-review"   element={<QuickReview />} />
        <Route path="/campaigns"      element={<Campaigns />} />
        <Route path="/priority"       element={<PriorityQueue />} />
        <Route path="/dm-generator"   element={<DmGenerator />} />
        <Route path="/exports"        element={<ExportPage />} />
        <Route path="/reports"        element={<Reports />} />
        <Route path="/settings"       element={<Settings />} />
        <Route path="/help"           element={<HelpGuide />} />
        <Route path="*"               element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export function App() {
  return <AppProvider><MemoryRouter><AppRoutes /></MemoryRouter></AppProvider>;
}

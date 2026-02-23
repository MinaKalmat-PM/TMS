
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LoadBoard from './components/LoadBoard';
import FleetView from './components/FleetView';
import DriverView from './components/DriverView';
import AccountingView from './components/AccountingView';
import AnalyticsView from './components/AnalyticsView';
import SystemSchemaView from './components/SystemSchemaView';
import RemindersView from './components/RemindersView';
import ReportsVault from './components/ReportsVault';
import OrientationAssistant from './components/OrientationAssistant';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'loads':
        return <LoadBoard />;
      case 'fleet':
        return <FleetView />;
      case 'drivers':
        return <DriverView />;
      case 'orientation':
        return <OrientationAssistant />;
      case 'reminders':
        return <RemindersView />;
      case 'accounting':
        return <AccountingView />;
      case 'vault':
        return <ReportsVault />;
      case 'analytics':
        return <AnalyticsView />;
      case 'schema':
        return <SystemSchemaView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;

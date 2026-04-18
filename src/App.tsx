/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { AuthView } from './components/AuthView';
import { FirestoreView } from './components/FirestoreView';
import { StorageView } from './components/StorageView';
import { AnalyticsView } from './components/AnalyticsView';
import { FunctionsView } from './components/FunctionsView';
import { HostingView } from './components/HostingView';
import { RulesView } from './components/RulesView';
import { SDKView } from './components/SDKView';
import { Service } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeService, setActiveService] = useState<Service>('auth');
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string>('');

  React.useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true);
      setErrorInfo(event.message || 'Unknown runtime error');
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-8">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-xl max-w-2xl w-full text-center">
          <div className="text-red-400 text-2xl font-bold mb-4">AuraDB Frontend Crash</div>
          <div className="bg-black/40 p-4 rounded-lg font-mono text-xs text-red-300 text-left mb-6 overflow-auto">
            {errorInfo}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-lg text-sm font-bold transition-all"
          >
            Attempt Restoration
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeService) {
      case 'auth':
        return <AuthView />;
      case 'firestore':
        return <FirestoreView />;
      case 'storage':
        return <StorageView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'functions':
        return <FunctionsView />;
      case 'hosting':
        return <HostingView />;
      case 'rules':
        return <RulesView />;
      case 'sdk':
        return <SDKView />;
      default:
        return <AuthView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A0C] text-zinc-300 font-sans selection:bg-blue-600/30">
      <Sidebar 
        activeService={activeService} 
        onServiceChange={setActiveService} 
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <Topbar />
        
        <div className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="px-8 py-4 border-t border-[#1F1F23] flex items-center justify-between bg-[#0A0A0C]">
          <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Status</a>
          </div>
          <div className="text-[10px] font-mono text-zinc-700">
            Node: aura-worker-v4.2 | v1.23.0-stable
          </div>
        </footer>
      </main>
    </div>
  );
}


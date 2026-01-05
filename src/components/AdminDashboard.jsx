import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import {
  LayoutDashboard,
  Settings,
  Database,
  ListTodo
} from 'lucide-react';

import StrategiesTab from './admin/StrategiesTab';
import MarginDataTab from './admin/MarginDataTab';
import SystemConfigTab from './admin/SystemConfigTab';
import { cn } from '../lib/utils';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('strategies');

  const tabs = [
    { value: 'strategies', label: 'Strategies', icon: ListTodo, component: <StrategiesTab /> },
    { value: 'margin', label: 'Margin Data', icon: Database, component: <MarginDataTab /> },
    { value: 'config', label: 'System Config', icon: Settings, component: <SystemConfigTab /> },
  ];

  return (
    <div className="min-h-screen bg-background pt-8 md:pt-16 pb-20">
      <div className="container mx-auto px-4 md:px-8">
        {/* HEADER */}
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/30">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Admin Center</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Manage market data and configurations
            </p>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="sticky top-20 z-10">
            <Tabs.List className="flex bg-card border border-border rounded-[2rem] p-2 shadow-xl shadow-black/5 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <Tabs.Trigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "flex items-center gap-2 px-6 py-4 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                        : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
          </div>

          <AnimatePresence mode="wait">
            {tabs.map((tab) => (
              <Tabs.Content
                key={tab.value}
                value={tab.value}
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {tab.component}
                </motion.div>
              </Tabs.Content>
            ))}
          </AnimatePresence>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default AdminDashboard;
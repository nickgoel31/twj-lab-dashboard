// components/cms/Sidebar.tsx
import React from 'react';
import { Briefcase, CreditCard, Image as ImageIcon, Save, LayoutDashboard } from 'lucide-react';
import { TabType } from './types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  
  const navItems = [
    // { id: 'services', label: 'Services', icon: <Layers size={18} /> },
    { id: 'pricing', label: 'Pricing Plans', icon: <CreditCard size={18} /> },
    { id: 'portfolio', label: 'Our Work', icon: <ImageIcon size={18} /> },
    { id: 'usecases', label: 'Use Cases', icon: <Briefcase size={18} /> },
  ];

  return (
    <aside className="left-0 fixed w-64 top-0 h-full bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
      <div className="p-6 border-b border-slate-100">
        <h1 className="font-bold text-xl flex items-center gap-2 text-indigo-600">
          <LayoutDashboard size={24} />
          Agency CMS
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium">
          <Save size={18} />
          Publish
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
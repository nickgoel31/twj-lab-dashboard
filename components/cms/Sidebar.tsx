// components/cms/Sidebar.tsx
import React, { useState } from 'react';
import { 
  Briefcase, 
  CreditCard, 
  Image as ImageIcon, 
  Save, 
  LayoutDashboard, 
  Menu, 
  X 
} from 'lucide-react';
import { TabType } from './types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    // { id: 'services', label: 'Services', icon: <Layers size={18} /> },
    { id: 'pricing', label: 'Pricing Plans', icon: <CreditCard size={18} /> },
    { id: 'portfolio', label: 'Our Work', icon: <ImageIcon size={18} /> },
    { id: 'usecases', label: 'Use Cases', icon: <Briefcase size={18} /> },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id as TabType);
    // Close sidebar on mobile when a selection is made
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* --- Mobile Trigger (Floating Hamburger) --- */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* --- Mobile Overlay (Backdrop) --- */}
      {/* This dims the background when menu is open on mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* --- Sidebar Container --- */}
      <aside 
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col shadow-xl z-40
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:shadow-sm
        `}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h1 className="font-bold text-xl flex items-center gap-2 text-indigo-600">
            <LayoutDashboard size={24} />
            Agency CMS
          </h1>
          {/* Close button only visible on mobile */}
          <button 
            onClick={() => setIsMobileOpen(false)} 
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
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
    </>
  );
};

export default Sidebar;
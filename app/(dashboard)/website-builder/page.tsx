"use client"
import React, { useEffect, useState } from 'react';
import { getPricingData, PricingCategoryWithPlans } from '@/actions/pricing';

// Components
import Sidebar from '@/components/cms/Sidebar';

// Pricing Specifics
import PricingEditor from '@/components/cms/PricingEditor';
import PricingPreview from '@/components/cms/PricingPreview';


import PortfolioEditor from '@/components/cms/PortfolioEditor';
import PortfolioPreview from '@/components/cms/PortfolioPreview';


// Types
import {  Service, TabType } from '@/components/cms/types';
import { getPortfolioData, PortfolioItemWithTestimonialsAndStats } from '@/actions/portfolio';

const WebsiteBuilder = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pricing');

  // --- 1. SERVICE STATE ---
  const [services, setServices] = useState<Service[]>([
    { id: 1, title: 'Web Development', desc: 'High performance websites built with Next.js', icon: 'code' },
    { id: 2, title: 'UI/UX Design', desc: 'User-centric design that drives conversion', icon: 'pen' },
  ]);

  // --- 2. PRICING STATE (Complex Structure) ---
  const [pricingData, setPricingData] = useState<PricingCategoryWithPlans[]>([]);

  // -- 3. PORTFOLIO STATE ---
  const [portfolioData, setPortfolioData] = useState<PortfolioItemWithTestimonialsAndStats[]>([]);

  // --- HANDLERS ---
  const handleServiceChange = (id: number, field: keyof Service, value: string) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getPricingData();
        const data2 = await getPortfolioData();
        setPricingData(data);
        setPortfolioData(data2);
      } catch (error) {
        console.error("Failed to load pricing", error);
      }
    };
    loadData();
  }, []);

  // Note: Pricing handlers are now internal to the PricingEditor component 
  // because the data structure is too deep for a simple handler here.

  return (
    // Changed: Removed 'pl-64' so flexbox positions sidebar naturally
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Fixed width sidebar */}
      <div className="w-64 shrink-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold capitalize text-slate-700">
             Editing: <span className="text-indigo-600">{activeTab}</span>
          </h2>
          <div className="flex items-center gap-3">
             <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Auto-saved</span>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
            
            {/* --- LEFT COLUMN: EDITOR --- */}
            <div className="h-full overflow-y-auto pr-2">
                {activeTab === 'pricing' ? (
                        <PricingEditor pricingData={pricingData} setPricingData={setPricingData} />
                    ) : activeTab === 'portfolio' ? (
                        <PortfolioEditor workData={portfolioData} setWorkData={setPortfolioData} />
                    ) :(
                    /* Render Standard Editor (Services, etc.) */
                    // <EditorSection 
                    //     activeTab={activeTab} 
                    //     services={services}
                    //     // We pass empty pricing here because EditorSection 
                    //     // doesn't handle the new complex pricing anymore
                    //     pricing={[]} 
                    //     onUpdateService={handleServiceChange}
                    //     onUpdatePricing={() => {}} 
                    // />
                    <></>
                )}
            </div>

            {/* --- RIGHT COLUMN: PREVIEW --- */}
            <div className="h-full overflow-y-auto pl-2">
                {activeTab === 'pricing' ? (
    <PricingPreview pricingData={pricingData} />
) : activeTab === 'portfolio' ? (
    <PortfolioPreview workData={portfolioData} />
) :(
                     /* Render Standard Preview */
                    // <PreviewSection 
                    //     activeTab={activeTab}
                    //     services={services}
                    //     pricing={[]} // Unused in standard preview now
                    // />
                    <></>
                )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default WebsiteBuilder;
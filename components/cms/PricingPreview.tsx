// components/cms/PricingPreview.tsx
import React, { useState } from 'react';
import { PricingPlanType } from './types';
import { Check, X, Sparkles } from 'lucide-react';

interface PricingPreviewProps {
  pricingData: PricingPlanType[];
}

// ✅ 1. Helper function to parse JSON strings safely
// This handles cases where data is "['a','b']" (string) or ['a','b'] (array)
const safeParseFeatures = (data: string | string[] | undefined | null): string[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data; // It's already an array
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : []; // Ensure result is array
  } catch (e) {
    console.error("Failed to parse pricing features:", e);
    return [];
  }
};

const PricingPreview = ({ pricingData }: PricingPreviewProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const currentCategory = pricingData[activeTab] || { plans: [] };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Category Tabs */}
      <div className="flex bg-slate-800 p-1 rounded-lg mb-8 overflow-x-auto max-w-full no-scrollbar">
        {pricingData.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap
              ${activeTab === idx 
                ? 'bg-white text-slate-900 shadow-lg' 
                : 'text-slate-400 hover:text-white'
              }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 w-full px-2">
        {currentCategory.plans.map((plan) => {
            
          // ✅ 2. Parse the strings here before rendering
          const featuresList = safeParseFeatures(plan.features);
          const notIncludedList = safeParseFeatures(plan.featuresNotIncluded);

          return (
            <div 
                key={plan.id} 
                className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300
                ${plan.featured 
                    ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-500/10 scale-105 z-10' 
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }
                `}
            >
                {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> Popular
                </div>
                )}

                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 min-h-[40px]">{plan.description}</p>
                </div>

                <div className="mb-6">
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                        {plan.price === 'contact-sales' ? (
                            <span className="text-xl">Contact Sales</span>
                        ) : (
                            plan.price
                        )}
                    </div>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                    {plan.everythingIncludedPrev && (
                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">
                            Everything in previous +
                        </div>
                    )}

                    {/* ✅ 3. Use the parsed variable 'featuresList' */}
                    {featuresList.map((feat, i) => (
                        <div key={`f-${i}`} className="flex items-start gap-3 text-sm text-slate-700">
                            <div className="bg-green-100 text-green-700 rounded-full p-0.5 mt-0.5 shrink-0">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="leading-tight">{feat}</span>
                        </div>
                    ))}

                    {/* ✅ 4. Use the parsed variable 'notIncludedList' */}
                    {notIncludedList.map((feat, i) => (
                        <div key={`nf-${i}`} className="flex items-start gap-3 text-sm text-slate-400 decoration-slate-300">
                                <div className="bg-slate-100 text-slate-400 rounded-full p-0.5 mt-0.5 shrink-0">
                                <X size={12} strokeWidth={3} />
                            </div>
                            <span className="leading-tight line-through decoration-slate-300">{feat}</span>
                        </div>
                    ))}
                </div>

                <button className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors
                    ${plan.featured
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }
                `}>
                    Choose {plan.name}
                </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingPreview;
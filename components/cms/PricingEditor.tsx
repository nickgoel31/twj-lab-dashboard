'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Ensure we import PricingPlan. Using standard client import or your specific path.
import { PricingPlan } from '@/lib/generated/prisma'; 
import { updatePricingPlan, createPricingPlan, deletePricingPlan, PricingCategoryWithPlans } from '@/actions/pricing'; 
import { Plus, Trash2, ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner'; 
import { useRouter } from 'next/navigation';

interface PricingEditorProps {
  pricingData: PricingCategoryWithPlans[]; 
  setPricingData: React.Dispatch<React.SetStateAction<PricingCategoryWithPlans[]>>;
}

const PricingEditor = ({ pricingData, setPricingData }: PricingEditorProps) => {
  const router = useRouter();
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<number | null>(null);

  // Safety: Ensure data is an array before processing
  const safePricingData = Array.isArray(pricingData) ? pricingData : [];

  // --- LOCAL STATE HELPERS ---
  const updatePlanLocal = (planId: number, field: keyof PricingPlan, value: any) => {
    const newData = [...safePricingData];
    const category = newData[selectedCategoryIndex];
    
    if (!category) return;

    category.plans = category.plans.map(plan => 
      plan.id === planId ? { ...plan, [field]: value } : plan
    );
    
    setPricingData(newData);
  };

  const handleFeature = (planId: number, type: 'features' | 'featuresNotIncluded', action: 'add' | 'remove', value?: string, index?: number) => {
    const newData = [...safePricingData];
    const category = newData[selectedCategoryIndex];
    if (!category) return;

    const planIndex = category.plans.findIndex(p => p.id === planId);
    if (planIndex === -1) return;

    const currentList = category.plans[planIndex][type];

    if (action === 'remove' && typeof index === 'number') {
        const newList = [...currentList];
        newList.splice(index, 1);
        category.plans[planIndex][type] = newList;
    } else if (action === 'add') {
        category.plans[planIndex][type] = [...currentList, "New Feature"];
    }

    setPricingData(newData);
  };

  const handleFeatureEdit = (planId: number, type: 'features' | 'featuresNotIncluded', index: number, text: string) => {
      const newData = [...safePricingData];
      const category = newData[selectedCategoryIndex];
      if (!category) return;

      const plan = category.plans.find(p => p.id === planId);
      
      if(plan && plan[type]) {
          const newList = [...plan[type]];
          newList[index] = text;
          plan[type] = newList;
          setPricingData(newData);
      }
  };

  // --- SERVER ACTION INTEGRATIONS ---

  const handleSave = async (plan: PricingPlan) => {
    setIsSaving(plan.id);
    const result = await updatePricingPlan(plan);
    setIsSaving(null);

    if (result.success) {
        toast.success("Plan updated successfully");
        router.refresh(); 
    } else {
        toast.error("Failed to update plan");
    }
  };

  const handleCreate = async () => {
    const category = safePricingData[selectedCategoryIndex];
    if (!category) return;

    toast.loading("Creating new plan...");
    const result = await createPricingPlan(category.id);
    
    if (result.success && result.data) {
        toast.dismiss();
        toast.success("New plan created");
        
        // --- FIX: Manually update local state immediately ---
        const newData = [...safePricingData];
        // result.data contains the newly created plan object from the DB
        newData[selectedCategoryIndex].plans.push(result.data);
        setPricingData(newData);
        
        // Automatically expand the new plan
        setExpandedPlanId(result.data.id);

        router.refresh(); // Still refresh to ensure server cache is clean
    } else {
        toast.dismiss();
        toast.error("Failed to create plan");
    }
  };

  const handleDelete = async (planId: number) => {
      if(!confirm("Are you sure you want to delete this plan?")) return;
      
      const result = await deletePricingPlan(planId);
      if(result.success) {
          toast.success("Plan deleted");

          // --- FIX: Manually update local state immediately ---
          const newData = [...safePricingData];
          const category = newData[selectedCategoryIndex];
          // Filter out the deleted plan
          category.plans = category.plans.filter(p => p.id !== planId);
          setPricingData(newData);

          router.refresh();
      } else {
          toast.error("Failed to delete");
      }
  }

  // Handle loading/empty state gracefully
  if (safePricingData.length === 0) {
    return (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <Loader2 className="animate-spin mx-auto text-indigo-500 mb-2" size={24} />
            <p className="text-slate-400 font-medium">Loading pricing data...</p>
        </div>
    );
  }

  const activeCategory = safePricingData[selectedCategoryIndex];

  return (
    <div className="space-y-6 pb-20">
      {/* Category Selector */}
      <div className="bg-slate-100 p-4 rounded-xl">
        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Select Category to Edit</label>
        <select 
          value={selectedCategoryIndex}
          onChange={(e) => {
            setSelectedCategoryIndex(Number(e.target.value));
            setExpandedPlanId(null);
          }}
          className="w-full p-2 rounded-lg border-slate-300 border bg-white font-medium focus:ring-2 ring-indigo-500 outline-none"
        >
          {safePricingData.map((cat, idx) => (
            <option key={idx} value={idx}>{cat.title}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {activeCategory && activeCategory.plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            
            {/* Plan Header */}
            <div 
              onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
              className="p-4 flex justify-between items-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${plan.featured ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                <div>
                  <h4 className="font-bold text-slate-800">{plan.name}</h4>
                  <p className="text-xs text-slate-500">{plan.price}</p>
                </div>
              </div>
              {expandedPlanId === plan.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {/* Plan Editor Body */}
            <AnimatePresence>
            {expandedPlanId === plan.id && (
              <motion.div 
                initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                className="overflow-hidden"
              >
               <div className="p-5 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="editor-label">Plan Name</label>
                        <input value={plan.name} onChange={(e) => updatePlanLocal(plan.id, 'name', e.target.value)} className="editor-input" />
                    </div>
                    <div>
                        <label className="editor-label">Price</label>
                        <input value={plan.price} onChange={(e) => updatePlanLocal(plan.id, 'price', e.target.value)} className="editor-input" />
                    </div>
                </div>

                <div>
                    <label className="editor-label">Description</label>
                    <textarea value={plan.description} onChange={(e) => updatePlanLocal(plan.id, 'description', e.target.value)} className="editor-input" rows={2} />
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={plan.featured} onChange={(e) => updatePlanLocal(plan.id, 'featured', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                        <span className="text-sm font-medium text-slate-600">Featured Plan</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={plan.everythingIncludedPrev} onChange={(e) => updatePlanLocal(plan.id, 'everythingIncludedPrev', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                        <span className="text-sm font-medium text-slate-600">&quot;Everything in previous&quot;</span>
                    </label>
                </div>

                {/* Features List Editor */}
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                        <label className="editor-label">Included Features</label>
                        <button onClick={() => handleFeature(plan.id, 'features', 'add')} className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:underline">
                            <Plus size={12} /> Add Feature
                        </button>
                    </div>
                    {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input 
                                value={feat} 
                                onChange={(e) => handleFeatureEdit(plan.id, 'features', idx, e.target.value)}
                                className="editor-input py-1 text-sm" 
                            />
                            <button onClick={() => handleFeature(plan.id, 'features', 'remove', undefined, idx)} className="text-slate-400 hover:text-red-500">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                 {/* Not Included List Editor */}
                 <div className="space-y-2 pt-2 border-t border-dashed border-slate-200">
                    <div className="flex justify-between items-center">
                        <label className="editor-label">Missing Features (Optional)</label>
                        <button onClick={() => handleFeature(plan.id, 'featuresNotIncluded', 'add')} className="text-xs flex items-center gap-1 text-slate-500 font-bold hover:underline">
                            <Plus size={12} /> Add Item
                        </button>
                    </div>
                    {plan.featuresNotIncluded.map((feat, idx) => (
                        <div key={idx} className="flex gap-2 opacity-75">
                            <input 
                                value={feat} 
                                onChange={(e) => handleFeatureEdit(plan.id, 'featuresNotIncluded', idx, e.target.value)}
                                className="editor-input py-1 text-sm bg-slate-50" 
                            />
                            <button onClick={() => handleFeature(plan.id, 'featuresNotIncluded', 'remove', undefined, idx)} className="text-slate-400 hover:text-red-500">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
                
                {/* ACTION BUTTONS */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                    <button 
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-500 text-sm flex items-center gap-2 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} /> Delete Plan
                    </button>

                    <button 
                        onClick={() => handleSave(plan)}
                        disabled={isSaving === plan.id}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        {isSaving === plan.id ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>

               </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        ))}

        {/* CREATE NEW PLAN BUTTON */}
        <button 
            onClick={handleCreate}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold flex flex-col items-center justify-center gap-2 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all group"
        >
            <div className="p-2 bg-slate-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                <Plus size={24} />
            </div>
            Create New Plan in &quot;{activeCategory?.title}&quot;
        </button>

      </div>
      
      <style>{`
        .editor-label { display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.25rem; }
        .editor-input { width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem; font-weight: 500; outline: none; }
        .editor-input:focus { border-color: #6366f1; }
      `}</style>
    </div>
  );
};

export default PricingEditor;
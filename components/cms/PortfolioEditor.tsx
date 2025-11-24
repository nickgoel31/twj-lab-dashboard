'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updatePortfolioItem, createPortfolioItem, deletePortfolioItem, PortfolioItemWithTestimonialsAndStats } from '@/actions/portfolio';
import { ChevronDown, ChevronUp, Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Briefcase, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PortfolioEditorProps {
  workData: PortfolioItemWithTestimonialsAndStats[];
  setWorkData: React.Dispatch<React.SetStateAction<PortfolioItemWithTestimonialsAndStats[]>>;
}

const PortfolioEditor = ({ workData, setWorkData }: PortfolioEditorProps) => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>('identity');
  const [isSaving, setIsSaving] = useState(false);

  // Ensure selectedId defaults to first item if available and not set
  useEffect(() => {
    if (selectedId === null && workData.length > 0) {
        setSelectedId(workData[0].id);
    }
  }, [workData, selectedId]);

  // Safety check for empty data
  if (!workData || workData.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-xl space-y-4">
            <p className="text-slate-500">No portfolio items found.</p>
            <button 
                onClick={async () => {
                    toast.loading("Creating first project...");
                    const res = await createPortfolioItem();
                    toast.dismiss();
                    if(res.success && res.data) {
                        setWorkData([res.data]);
                        setSelectedId(res.data.id);
                        toast.success("Project created");
                        router.refresh();
                    }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm"
            >
                <Plus size={16} /> Create First Project
            </button>
        </div>
     )
  }

  const selectedProject = workData.find(w => w.id === selectedId) || workData[0];

  // --- LOCAL HELPERS ---

  const updateField = (field: keyof PortfolioItemWithTestimonialsAndStats, value: any) => {
    setWorkData(prev => prev.map(item => item.id === selectedId ? { ...item, [field]: value } : item));
  };

  const updateNestedField = (parent: 'testimonial' | 'stats', field: string, value: string) => {
    setWorkData(prev => prev.map(item => {
        if (item.id !== selectedId) return item;
        
        // Ensure the parent object exists before assigning
        const parentObj = item[parent] || {} as any; 
        
        return { 
            ...item, 
            [parent]: { 
                ...parentObj, 
                [field]: value 
            } 
        };
    }));
  };

  const handleArray = (field: 'services' | 'media', action: 'add' | 'remove', value?: string, index?: number) => {
    const currentList = selectedProject[field] || [];
    let newList = [...currentList];

    if (action === 'remove' && typeof index === 'number') {
        newList.splice(index, 1);
    } else if (action === 'add') {
        newList.push(value || "New Item");
    }
    updateField(field, newList);
  };

  // --- SERVER ACTIONS ---

  const handleSave = async () => {
      setIsSaving(true);
      const result = await updatePortfolioItem(selectedProject);
      setIsSaving(false);

      if (result.success) {
          toast.success("Project saved successfully");
          router.refresh();
      } else {
          toast.error("Failed to save project");
      }
  };

  const handleCreate = async () => {
      toast.loading("Creating new project...");
      const result = await createPortfolioItem();
      toast.dismiss();

      if (result.success && result.data) {
          toast.success("New project created");
          
          // Optimistic Update
          const newData = [...workData, result.data];
          setWorkData(newData);
          setSelectedId(result.data.id);
          
          router.refresh();
      } else {
          toast.error("Failed to create project");
      }
  };

  const handleDelete = async () => {
      if(!selectedId) return;
      if(!confirm(`Are you sure you want to delete "${selectedProject.companyName}"?`)) return;

      const result = await deletePortfolioItem(selectedId);
      
      if(result.success) {
          toast.success("Project deleted");
          
          // Optimistic Update
          const newData = workData.filter(i => i.id !== selectedId);
          setWorkData(newData);
          setSelectedId(newData.length > 0 ? newData[0].id : null);

          router.refresh();
      } else {
          toast.error("Failed to delete project");
      }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Project Selector Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar items-center">
        {workData.map((project) => (
            <button
                key={project.id}
                onClick={() => setSelectedId(project.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border
                    ${selectedId === project.id 
                        ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
            >
                {selectedId === project.id && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
                {project.companyName || 'Untitled Project'}
            </button>
        ))}
        <button 
            onClick={handleCreate}
            className="px-3 py-2 rounded-full border border-dashed border-slate-300 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            title="Add New Project"
        >
            <Plus size={16} />
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
        
        {/* Save Action Bar (Sticky Top) */}
        <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-100">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Editing: <span className="text-slate-700">{selectedProject.companyName}</span>
             </div>
             <div className="flex gap-2">
                 <button 
                    onClick={handleDelete}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Project"
                 >
                    <Trash2 size={18} />
                 </button>
                 <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm shadow-sm transition-all disabled:opacity-50"
                 >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Changes
                 </button>
             </div>
        </div>
        
        {/* SECTION: Identity & Hero */}
        <AccordionItem title="Identity & Hero" isOpen={activeSection === 'identity'} onClick={() => setActiveSection('identity')}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Company Name" value={selectedProject.companyName} onChange={(v) => updateField('companyName', v)} />
                    <InputGroup label="Industry" value={selectedProject.industry} onChange={(v) => updateField('industry', v)} />
                </div>
                <InputGroup label="Hero Headline" value={selectedProject.heroLine || ''} onChange={(v) => updateField('heroLine', v)} />
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Location" value={selectedProject.location} onChange={(v) => updateField('location', v)} />
                    <InputGroup label="Website URL" value={selectedProject.website} onChange={(v) => updateField('website', v)} icon={<LinkIcon size={14}/>} />
                </div>
                <InputGroup label="Hero Image URL" value={selectedProject.heroImage} onChange={(v) => updateField('heroImage', v)} icon={<ImageIcon size={14}/>} />
                <InputGroup label="Company Logo URL" value={selectedProject.companyLogo} onChange={(v) => updateField('companyLogo', v)} icon={<ImageIcon size={14}/>} />
            </div>
        </AccordionItem>

        {/* SECTION: The Content */}
        <AccordionItem title="Case Study Content" isOpen={activeSection === 'content'} onClick={() => setActiveSection('content')}>
            <div className="space-y-4">
                <InputGroup label="Project Duration" value={selectedProject.projectDuration} onChange={(v) => updateField('projectDuration', v)} />
                
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Short Description</label>
                    <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                        rows={3} 
                        value={selectedProject.description}
                        onChange={(e) => updateField('description', e.target.value)}
                    />
                </div>

                <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-800 bg-slate-100 p-2 rounded">The Challenge (Problem)</h4>
                    <textarea className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm" rows={3} value={selectedProject.problemStatement} onChange={(e) => updateField('problemStatement', e.target.value)}/>
                    
                    <h4 className="text-xs font-bold text-slate-800 bg-slate-100 p-2 rounded">The Solution</h4>
                    <textarea className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm" rows={3} value={selectedProject.solution} onChange={(e) => updateField('solution', e.target.value)}/>
                    
                    <h4 className="text-xs font-bold text-slate-800 bg-slate-100 p-2 rounded">The Results</h4>
                    <textarea className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm" rows={3} value={selectedProject.results} onChange={(e) => updateField('results', e.target.value)}/>
                </div>
            </div>
        </AccordionItem>

        {/* SECTION: Stats & Testimonials */}
        <AccordionItem title="Stats, Tags & Media" isOpen={activeSection === 'stats'} onClick={() => setActiveSection('stats')}>
            <div className="space-y-6">
                
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                    <InputGroup label="Traffic Growth" value={selectedProject.stats?.trafficGrowth || ''} onChange={(v) => updateNestedField('stats', 'trafficGrowth', v)} placeholder="+20%" />
                    <InputGroup label="Conv. Rate" value={selectedProject.stats?.conversionRateIncrease || ''} onChange={(v) => updateNestedField('stats', 'conversionRateIncrease', v)} placeholder="+35%" />
                    <InputGroup label="User Growth" value={selectedProject.stats?.userGrowth || ''} onChange={(v) => updateNestedField('stats', 'userGrowth', v)} placeholder="+10%" />
                </div>

                {/* Services Tags */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Services Provided</label>
                        <button onClick={() => handleArray('services', 'add', 'New Service')} className="text-indigo-600 text-xs font-bold hover:underline">+ Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedProject.services.map((service, idx) => (
                            <div key={idx} className="flex items-center bg-slate-100 px-2 py-1 rounded text-sm">
                                <input 
                                    className="bg-transparent border-none focus:outline-none w-auto min-w-[50px] text-slate-700"
                                    value={service}
                                    onChange={(e) => {
                                        const newArr = [...selectedProject.services];
                                        newArr[idx] = e.target.value;
                                        updateField('services', newArr);
                                    }}
                                />
                                <button onClick={() => handleArray('services', 'remove', undefined, idx)} className="ml-1 text-slate-400 hover:text-red-500"><Trash2 size={12}/></button>
                            </div>
                        ))}
                    </div>
                </div>
                
                 {/* Media Images */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Gallery Images</label>
                        <button onClick={() => handleArray('media', 'add', '/placeholder.jpg')} className="text-indigo-600 text-xs font-bold hover:underline">+ Add Image URL</button>
                    </div>
                    <div className="space-y-2">
                        {selectedProject.media.map((url, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input 
                                    value={url} 
                                    onChange={(e) => {
                                        const newArr = [...selectedProject.media];
                                        newArr[idx] = e.target.value;
                                        updateField('media', newArr);
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded p-1 text-sm"
                                />
                                <button onClick={() => handleArray('media', 'remove', undefined, idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* Testimonial */}
                 <div className="border p-3 rounded-lg bg-slate-50 border-dashed border-slate-300">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex items-center gap-2"><Briefcase size={12} /> Client Testimonial</label>
                    <textarea placeholder="Quote..." className="w-full text-sm p-2 rounded border border-slate-200 mb-2" rows={2} value={selectedProject.testimonial?.quote || ''} onChange={(e) => updateNestedField('testimonial', 'quote', e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                        <input placeholder="Author Name" className="text-sm p-2 rounded border border-slate-200" value={selectedProject.testimonial?.author || ''} onChange={(e) => updateNestedField('testimonial', 'author', e.target.value)} />
                        <input placeholder="Designation" className="text-sm p-2 rounded border border-slate-200" value={selectedProject.testimonial?.designation || ''} onChange={(e) => updateNestedField('testimonial', 'designation', e.target.value)} />
                    </div>
                 </div>

            </div>
        </AccordionItem>
      </div>
    </div>
  );
};

// --- Sub-Components for Editor ---
const AccordionItem = ({ title, isOpen, onClick, children }: any) => (
    <div className="border-b border-slate-100 last:border-0">
        <button onClick={onClick} className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
            <span className="font-bold text-slate-700">{title}</span>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 bg-white">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const InputGroup = ({ label, value, onChange, icon, placeholder }: any) => (
    <div>
        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-3 top-2.5 text-slate-400">{icon}</div>}
            <input 
                className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium focus:outline-none focus:border-indigo-500 ${icon ? 'pl-9' : ''}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    </div>
);

export default PortfolioEditor;
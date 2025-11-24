// app/leads/LeadsDashboard.tsx

'use client';

import React, { useState, useMemo, useEffect, useRef, useTransition } from 'react';
import type { InteractionType } from '@/lib/generated/prisma'
import { BadgeDollarSignIcon, BriefcaseMedicalIcon, Building2Icon, Edit, Globe2Icon, Lightbulb, Mail, MailIcon, MessageSquareText, Phone, Plus, PlusIcon, Trash2, User2Icon, UserCheck, Users, Video } from 'lucide-react';
import CreateLeadModal from './CreateLeadModal';
import { addInteractionLog, convertToClient, deleteLead, LeadWithDetails, updateLead, UpdateLeadFormData } from '@/actions/leads';
import DeleteConfirmModal from './DeleteConfirmModal';

// --- TYPESCRIPT INTERFACE ---

interface LeadsDashboardProps {
  initialLeads: LeadWithDetails[]
}

// --- SVG ICONS ---
const UserIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const FireIcon = ({ className = "w-5 h-5" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.003 8.003 0 0112 2a8.003 8.003 0 016.014 2.986C20.5 5 21 8 21 10c2 1 2.657 1.343 2.657 1.343a8 8 0 01-6.001 7.314z" /></svg>);
const ChevronLeftIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>);

// --- HELPER FUNCTIONS ---
const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
        'NEW': 'bg-accent text-accent-foreground',
        'CONTACTED': 'bg-blue-500/20 text-blue-500',
        'QUALIFIED': 'bg-purple-500/20 text-purple-500',
        'PROPOSAL': 'bg-yellow-500/20 text-yellow-500',
        'NEGOTIATION': 'bg-orange-500/20 text-orange-500',
    };
    return colors[stage.toUpperCase()] || 'bg-muted text-muted-foreground';
};

// Helper function to get an icon based on the interaction type
const getInteractionIcon = (type: InteractionType) => {
  switch (type) {
    case 'EMAIL_SENT': case 'EMAIL_RECEIVED':
      return <Mail className="h-5 w-5 text-muted-foreground" />;
    case 'PHONE_CALL':
      return <Phone className="h-5 w-5 text-muted-foreground" />;
    case 'VIDEO_CALL':
      return <Video className="h-5 w-5 text-muted-foreground" />;
    case 'MEETING':
      return <Users className="h-5 w-5 text-muted-foreground" />;
    default:
      return <MessageSquareText className="h-5 w-5 text-muted-foreground" />;
  }
};

// --- UI COMPONENTS ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-card text-card-foreground rounded-lg border border-border p-6 ${className}`}>
    {children}
  </div>
);

const LeadList: React.FC<{
  groupedLeads: Record<string, LeadWithDetails[]>;
  selectedLeadId: number | null;
  onSelectLead: (id: number) => void;
  onOpenCreateModal: () => void; // <-- New prop to open the modal
  filters: {
      groupBy: 'industry' | 'country' | null;
      setGroupBy: (value: 'industry' | 'country' | null) => void;
      dealValueFilter: number;
      setDealValueFilter: (value: number) => void;
      currencyFilter: string;
      setCurrencyFilter: (value: string) => void;
      currencies: string[];
  };
}> = ({ groupedLeads, selectedLeadId, onSelectLead,onOpenCreateModal, filters }) => (
  <div className="bg-muted border-r border-border h-full flex flex-col">
    <div className="p-4 border-b border-border">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-foreground">Prospects & Leads</h2>
          <p className="text-sm text-muted-foreground mt-1">Filter and group your prospects.</p>
        </div>
        <button 
          onClick={onOpenCreateModal} 
          className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label="Create new lead"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
    
    <div className="p-4 border-b border-border">
        <div className="space-y-4">
            <div>
                <label className="text-xs font-medium text-muted-foreground">Group By</label>
                <div className="flex space-x-2 mt-1">
                    <button onClick={() => filters.setGroupBy('industry')} className={`px-3 py-1 text-sm rounded-md w-full ${filters.groupBy === 'industry' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}>Industry</button>
                    <button onClick={() => filters.setGroupBy('country')} className={`px-3 py-1 text-sm rounded-md w-full ${filters.groupBy === 'country' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}>Country</button>
                    <button onClick={() => filters.setGroupBy(null)} className={`px-3 py-1 text-sm rounded-md w-full ${filters.groupBy === null ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}>None</button>
                </div>
            </div>
            <div>
                <label htmlFor="dealValue" className="text-xs font-medium text-muted-foreground">Min Deal Value (&gt; {filters.dealValueFilter.toLocaleString()})</label>
                <input id="dealValue" type="range" min="5000" max="100000" step="1000" value={filters.dealValueFilter} onChange={(e) => filters.setDealValueFilter(Number(e.target.value))} className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer mt-2"/>
            </div>
            <div>
                <label htmlFor="currency" className="text-xs font-medium text-muted-foreground">Currency</label>
                <select id="currency" value={filters.currencyFilter} onChange={(e) => filters.setCurrencyFilter(e.target.value)} className="w-full mt-1 p-2 bg-background border border-border rounded-md text-sm">
                   {filters.currencies.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
            </div>
        </div>
    </div>
    
    <div className="flex-grow overflow-y-auto p-2">
      {Object.entries(groupedLeads).map(([groupName, leadsInGroup]) => (
        <div key={groupName} className="mb-4">
          {filters.groupBy && <h3 className="text-sm font-semibold text-muted-foreground px-2 my-2">{groupName} ({leadsInGroup.length})</h3>}
          {leadsInGroup.length > 0 ? (
            leadsInGroup.map(lead => (
              <button key={lead.id} onClick={() => onSelectLead(lead.id)} className={`w-full text-left p-3 rounded-md transition-colors duration-150 mb-1 ${selectedLeadId === lead.id ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`font-semibold ${selectedLeadId === lead.id ? 'text-primary-foreground' : 'text-foreground'}`}>{lead.name}</p>
                    <p className={`text-sm ${selectedLeadId === lead.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{lead.company}</p>
                  </div>
                  {lead.leadScore > 80 && (<div className={`flex items-center space-x-1 ${selectedLeadId === lead.id ? 'text-primary-foreground/80' : 'text-chart-5'}`}><FireIcon className="w-5 h-5" /><span className="font-bold text-sm">{lead.leadScore}</span></div>)}
                </div>
              </button>
            ))
          ) : (
             <p className="text-sm text-muted-foreground px-2">No leads in this group match filters.</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

const LeadProfile: React.FC<{ lead: LeadWithDetails | null; onBack: () => void; }> = ({ lead, onBack }) => {
  const editFormRef = useRef<HTMLFormElement>(null);
  const logFormRef = useRef<HTMLFormElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isConvertPending, startConvertTransition] = useTransition();

  

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-full bg-background"><div className="text-center p-4"><UserIcon className="w-16 h-16 mx-auto text-muted-foreground" /><h3 className="mt-2 text-lg font-medium text-foreground">Select a lead</h3><p className="mt-1 text-sm text-muted-foreground">Choose a lead from the list to view their details.</p></div></div>
    );
  }

  const notContactedSince = Math.floor((Date.now() - new Date(lead.lastContacted).getTime()) / (1000 * 60 * 60 * 24));

  const handleLogSubmit = (formData: FormData) => {
    startUpdateTransition(async () => {
      await addInteractionLog(formData);
      logFormRef.current?.reset();
    });
  };
  
  const handleUpdate = (formData: FormData) => {
    const data: UpdateLeadFormData = {
      name: formData.get('name') as string,
      companyName: formData.get('companyName') as string,
      industry: formData.get('industry') as string,
      country: formData.get('country') as string,
      dealValue: formData.get('dealValue') as string,
      currency: formData.get('currency') as string,
      projectSummary: formData.get('projectSummary') as string,
      contactNotes: formData.get('contactNotes') as string,
    };

    startUpdateTransition(async () => {
      await updateLead(lead.id, data);
      setIsEditing(false);
    });
  };

  const triggerUpdate = () => {
    if (editFormRef.current) {
      const formData = new FormData(editFormRef.current);
      handleUpdate(formData);
    }
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteLead(lead.id);
      if (result.success) {
        setShowDeleteModal(false);
        onBack();
      }
    });
  };

  // 👇 4. ADD THE HANDLER FOR THE CONVERT ACTION
  const handleConvert = () => {
    if (!lead) return;
    startConvertTransition(async () => {
      await convertToClient(lead.id);
      // No need to manually update state here. `revalidatePath` will refresh the data,
      // which will remove the lead from the list and trigger the useEffect in the parent.
    });
  };
  
  const contactNotesString = lead.contactNotes.map(note => note.content).join('\n');
  
  const leadInfoDisplay = [
    { icon: <User2Icon className="text-muted-foreground" />, label: 'Name', value: lead.name },
    { icon: <MailIcon className="text-muted-foreground" />, label: 'Email', value: lead.email },
    { icon: <Building2Icon className="text-muted-foreground" />, label: 'Company', value: lead.company },
    { icon: <Globe2Icon className="text-muted-foreground" />, label: 'Country', value: lead.country },
    { icon: <BriefcaseMedicalIcon className="text-muted-foreground" />, label: 'Industry', value: lead.industry },
    { icon: <BadgeDollarSignIcon className="text-muted-foreground" />, label: 'Deal Value', value: `${new Intl.NumberFormat('en-US', { style: 'currency', currency: lead.currency }).format(lead.dealValue)}`},
  ];

  return (
    <>
      <form ref={editFormRef} className="p-6 h-full overflow-y-auto bg-background">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <button onClick={onBack} type="button" className="md:hidden flex items-center mb-4 text-sm font-semibold text-muted-foreground hover:text-foreground"><ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to list</button>
            {isEditing ? (
              <input type="text" name="name" defaultValue={lead.name} required className="text-3xl font-bold bg-transparent border-b-2 border-input focus:border-primary focus:outline-none" />
            ) : (
              <h1 className="text-3xl font-bold text-foreground">{lead.name}</h1>
            )}
            {isEditing ? (
              <input type="text" name="companyName" defaultValue={lead.company} required className="text-muted-foreground bg-transparent border-b border-input focus:border-primary focus:outline-none text-sm mt-1" />
            ) : (
              <p className="text-muted-foreground">{lead.company}</p>
            )}
            <div className="mt-2">
              <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStageColor(lead.leadStage)}`}>{lead.leadStage}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-2 text-sm font-medium rounded-md bg-muted text-muted-foreground hover:bg-accent">Cancel</button>
                <button type="button" onClick={triggerUpdate} disabled={isUpdatePending} className="px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {isUpdatePending ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
               {/* 👇 5. ADD THE "CONVERT TO CLIENT" BUTTON HERE */}
                <button 
                  type="button" 
                  onClick={handleConvert}
                  disabled={isConvertPending}
                  className="p-2 text-sm font-medium rounded-md bg-green-500/10 text-green-600 hover:bg-green-500/20 disabled:opacity-50"
                  aria-label="Convert to Client"
                >
                  {isConvertPending ? '...' : <UserCheck className="h-5 w-5"/>}
                </button>
                <button type="button" onClick={() => setShowDeleteModal(true)} className="p-2 text-sm font-medium rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/20">
                  <Trash2 className="h-5 w-5"/>
                </button>
                <button type="button" onClick={() => setIsEditing(true)} className="p-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  <Edit className="h-5 w-5"/>
                </button>
              </>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">Lead Details</h3>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="text-xs text-muted-foreground block mb-1">Email</label>
                    <input type="email" id="email" name="email" defaultValue={lead.email} required className="w-full bg-background border border-input rounded-md p-2 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="country" className="text-xs text-muted-foreground block mb-1">Country</label>
                    <input type="text" id="country" name="country" defaultValue={lead.country} required className="w-full bg-background border border-input rounded-md p-2 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="industry" className="text-xs text-muted-foreground block mb-1">Industry</label>
                    <input type="text" id="industry" name="industry" defaultValue={lead.industry} required className="w-full bg-background border border-input rounded-md p-2 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="dealValue" className="text-xs text-muted-foreground block mb-1">Deal Value</label>
                    <input type="number" id="dealValue" name="dealValue" defaultValue={lead.dealValue} required className="w-full bg-background border border-input rounded-md p-2 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="currency" className="text-xs text-muted-foreground block mb-1">Currency</label>
                    <select id="currency" name="currency" defaultValue={lead.currency} className="w-full bg-background border border-input rounded-md p-2 text-sm">
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leadInfoDisplay.map(item => (
                    <div key={item.label} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">{item.icon}</div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-medium text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">Project Summary</h3>
              {isEditing ? (
                <textarea name="projectSummary" defaultValue={lead.projectSummary} required rows={4} className="w-full bg-background border border-input rounded-md p-2 text-sm" />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lead.projectSummary}</p>
              )}
            </Card>
            
            {/* The Interaction Timeline card is OUTSIDE the main edit form */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">Interaction Timeline</h3>
              <div className="space-y-6">
                {lead.interactionLogs.map(log => (
                  <div key={log.id} className="flex space-x-4">
                    <div className="flex flex-col items-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">{getInteractionIcon(log.type)}</span>
                      <div className="h-full w-px bg-border"></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-sm">{log.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{log.content}</p>
                      {log.followUpSuggestion && (
                        <div className="mt-2 flex items-center space-x-2 rounded-md bg-amber-500/10 p-2 text-xs text-amber-700">
                          <Lightbulb className="h-4 w-4 flex-shrink-0"/>
                          <span><strong>Suggestion:</strong> {log.followUpSuggestion}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex space-x-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Plus/></span>
                  {/* This is its own separate form, which is valid */}
                  <form action={handleLogSubmit} ref={logFormRef} className="flex-1">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <div className="rounded-md border border-input">
                      <textarea name="content" placeholder="Log a new interaction..." required className="w-full p-2 bg-transparent text-sm focus:outline-none resize-none"></textarea>
                      <div className="flex justify-between items-center border-t bg-muted/50 p-2">
                        <select name="type" defaultValue="NOTE_ADDED" className="bg-transparent text-xs focus:outline-none">
                          <option value="NOTE_ADDED">Note</option>
                          <option value="EMAIL_SENT">Email Sent</option>
                          <option value="PHONE_CALL">Phone Call</option>
                          <option value="MEETING">Meeting</option>
                        </select>
                        <button type="submit" className="px-3 py-1 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Log</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </Card>

          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">Contact Notes</h3>
              {isEditing ? (
                <textarea name="contactNotes" defaultValue={contactNotesString} rows={5} className="w-full bg-background border border-input rounded-md p-2 text-sm" placeholder="One note per line..."/>
              ) : (
                 <ul className="space-y-2">
                   {lead.contactNotes.map((note) => <li key={note.id} className="text-sm text-muted-foreground list-disc list-inside">{note.content}</li>)}
                 </ul>
              )}
            </Card>

            <Card className="bg-secondary">
              <h3 className="text-lg font-semibold text-secondary-foreground mb-2">AI Lead Score</h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-full bg-muted rounded-full h-2.5"><div className="bg-chart-2 h-2.5 rounded-full" style={{ width: `${lead.leadScore}%` }}></div></div>
                <span className="font-bold text-chart-2">{lead.leadScore}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">AI predicts this is a strong lead.</p>
              {notContactedSince > 7 && (
                <div className="bg-amber-500/10 p-3 rounded-lg mt-4">
                  <p className="text-sm font-medium text-amber-700">Follow-up Suggestion</p>
                  <p className="text-xs text-amber-600 mt-1">
                    You haven&apos;t contacted {lead.name} in {notContactedSince} days.
                    <a href={`mailto:${lead.email}`} className="font-semibold underline ml-1">Draft follow-up?</a>
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </form>
      
      <DeleteConfirmModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={handleDelete}
        isPending={isDeletePending}
      />
    </>
  );
};

// --- MAIN APP COMPONENT ---
export default function LeadsDashboard({ initialLeads }: LeadsDashboardProps) {
  const leads = initialLeads;

  const [isModalOpen, setIsModalOpen] = useState(false); // <-- State for the modal

  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(leads[0]?.id ?? null);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  
  // Filters State
  const [groupBy, setGroupBy] = useState<'industry' | 'country' | null>('industry');
  const [dealValueFilter, setDealValueFilter] = useState<number>(10000);
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  // Effect to handle data refreshes from the server
  useEffect(() => {
    const currentLeadExists = leads.some(l => l.id === selectedLeadId);
    if (!currentLeadExists) {
        setSelectedLeadId(leads[0]?.id ?? null);
    }
  }, [leads, selectedLeadId]);

  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId) ?? null, [selectedLeadId, leads]);
  
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => 
        lead.dealValue >= dealValueFilter &&
        (currencyFilter === 'all' || lead.currency === currencyFilter)
    );
  }, [leads, dealValueFilter, currencyFilter]);

  const groupedLeads = useMemo(() => {
    const defaultGroup = { 'All Leads': filteredLeads };
    if (!groupBy) return defaultGroup;
    
    const groups = filteredLeads.reduce((acc, lead) => {
        const key = lead[groupBy];
        if (!acc[key]) acc[key] = [];
        acc[key].push(lead);
        return acc;
    }, {} as Record<string, LeadWithDetails[]>);
    
    return Object.keys(groups).length > 0 ? groups : { [`No leads for filter`]: [] };

  }, [filteredLeads, groupBy]);

  const handleSelectLead = (id: number) => {
    setSelectedLeadId(id);
    setIsProfileVisible(true);
  };
  
  const handleBackToList = () => {
    setIsProfileVisible(false);
  };

  const currencies = ['all', ...Array.from(new Set(initialLeads.map(l => l.currency)))];
  const filterProps = { groupBy, setGroupBy, dealValueFilter, setDealValueFilter, currencyFilter, setCurrencyFilter, currencies };

  return (
    <>
    <main className="h-screen w-full bg-background font-sans flex flex-col antialiased">
      <div className="flex-grow md:grid md:grid-cols-4 min-h-0">
        <aside className={`md:col-span-1 h-full ${isProfileVisible && 'hidden'} md:block`}>
          <LeadList groupedLeads={groupedLeads} selectedLeadId={selectedLeadId} onSelectLead={handleSelectLead} filters={filterProps} onOpenCreateModal={() => setIsModalOpen(true)} />
        </aside>
        <section className={`md:col-span-3 min-w-0 h-full ${!isProfileVisible && 'hidden'} md:block`}>
          <LeadProfile lead={selectedLead} onBack={handleBackToList} />
        </section>
      </div>
    </main>
      <CreateLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
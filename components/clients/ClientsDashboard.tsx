"use client";

import React, { useState, useMemo, useRef, useTransition, useEffect } from 'react';
import { addInteractionLogClient, ClientWithDetails, deleteInteractionLogClient, updateClient, UpdateClientFormData } from '@/actions/clients';
import { InteractionLog as PrismaInteractionLog, DocumentVault as PrismaDocumentVault, InteractionType, PaymentTerms } from '@/lib/generated/prisma';
import { SparklesIcon, Mail, Phone, Video, Users, MessageSquareText, PlusIcon, Currency, BadgeDollarSign, Calendar, Edit, Plus, Trash2 } from 'lucide-react';
import { uploadDocument } from '@/actions/document-vault';

// --- SVG ICONS ---
const UserIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const BuildingIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>);
const GlobeIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.704 4.318a9.027 9.027 0 014.592 0m-4.592 0a9.027 9.027 0 00-4.592 0m16.296 0a9.027 9.027 0 01-4.592 0m0 0a9.027 9.027 0 004.592 0M12 10a2 2 0 110-4 2 2 0 010 4z" /></svg>);
const ChevronLeftIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>);

// --- HELPER FUNCTIONS ---
const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
        'ACTIVE': 'bg-green-500/20 text-green-500',
        'ON_HOLD': 'bg-yellow-500/20 text-yellow-500',
        'COMPLETED': 'bg-blue-500/20 text-blue-500',
    };
    return colors[status.toUpperCase()] || 'bg-muted text-muted-foreground';
};

const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
        case 'EMAIL_SENT': case 'EMAIL_RECEIVED': return <Mail className="h-5 w-5 text-muted-foreground" />;
        case 'PHONE_CALL': return <Phone className="h-5 w-5 text-muted-foreground" />;
        case 'VIDEO_CALL': return <Video className="h-5 w-5 text-muted-foreground" />;
        case 'MEETING': return <Users className="h-5 w-5 text-muted-foreground" />;
        default: return <MessageSquareText className="h-5 w-5 text-muted-foreground" />;
    }
};

const PaymentTermsOptions: PaymentTerms[] = [
  "THIRTY_SEVENTY",
  "FIFTY_FIFTY",
  "SEVENTY_THIRTY",
  "ZERO_FULL",
  "FULL_ZERO",
  "CUSTOM_TERMS"
];

// --- UI COMPONENTS ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-card text-card-foreground rounded-lg border border-border p-6 ${className}`}>{children}</div>
);

const ClientList: React.FC<{
    groupedClients: Record<string, ClientWithDetails[]>;
    selectedClientId: string | null;
    onSelectClient: (id: string) => void;
    onOpenCreateModal: () => void;
    filters: {
        groupBy: 'country' | 'status' | null;
        setGroupBy: (value: 'country' | 'status' | null) => void;
        dealValueFilter: number;
        setDealValueFilter: (value: number) => void;
        currencyFilter: string;
        setCurrencyFilter: (value: string) => void;
        currencies: string[];
    };
}> = ({ groupedClients, selectedClientId, onSelectClient, onOpenCreateModal, filters }) => (
    <div className="bg-muted border-r border-border h-full flex flex-col">
        <div className="p-4 border-b border-border">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Current Clients</h2>
                    <p className="text-sm text-muted-foreground mt-1">Filter and group your clients.</p>
                </div>
                <button 
                    onClick={onOpenCreateModal} 
                    className="p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    aria-label="Create new client"
                >
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
        
        <div className="p-4 border-b border-border">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-medium text-muted-foreground">Group By</label>
                    <div className="flex space-x-2 mt-1">
                        <button onClick={() => filters.setGroupBy('status')} className={`px-3 py-1 text-sm rounded-md w-full ${filters.groupBy === 'status' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}>Status</button>
                        <button onClick={() => filters.setGroupBy('country')} className={`px-3 py-1 text-sm rounded-md w-full ${filters.groupBy === 'country' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}>Country</button>
                        <button onClick={() => filters.setGroupBy(null)} className={`px-3 py-1 text-sm rounded-md w-full ${filters.groupBy === null ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}>None</button>
                    </div>
                </div>
                <div>
                    <label htmlFor="dealValue" className="text-xs font-medium text-muted-foreground">Min Deal Value (&gt; {filters.dealValueFilter.toLocaleString()})</label>
                    <input id="dealValue" type="range" min="0" max="100000" step="1000" value={filters.dealValueFilter} onChange={(e) => filters.setDealValueFilter(Number(e.target.value))} className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer mt-2"/>
                </div>
                <div>
                    <label htmlFor="currency" className="text-xs font-medium text-muted-foreground">Currency</label>
                    <select id="currency" value={filters.currencyFilter} onChange={(e) => filters.setCurrencyFilter(e.target.value)} className="w-full mt-1 p-2 bg-background border border-border rounded-md text-sm">
                        {filters.currencies.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                </div>
            </div>
        </div>
        
        <div className="grow overflow-y-auto p-2">
            {Object.entries(groupedClients).map(([groupName, clientsInGroup]) => (
                <div key={groupName} className="mb-4">
                    {filters.groupBy && <h3 className="text-sm font-semibold text-muted-foreground px-2 my-2">{groupName} ({clientsInGroup.length})</h3>}
                    {clientsInGroup.length > 0 ? (
                        clientsInGroup.map(client => (
                            <button key={client.id} onClick={() => onSelectClient(client.id)} className={`w-full text-left p-3 rounded-md transition-colors duration-150 mb-1 ${selectedClientId === client.id ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-accent'}`}>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className={`font-semibold ${selectedClientId === client.id ? 'text-primary-foreground' : 'text-foreground'}`}>{client.name}</p>
                                        <p className={`text-sm ${selectedClientId === client.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{client.companyName}</p>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground px-2">No clients match the current filters.</p>
                    )}
                </div>
            ))}
        </div>
    </div>
);

const ClientProfile: React.FC<{ client: ClientWithDetails | null; onBack: () => void; }> = ({ client, onBack }) => {
    const editFormRef = useRef<HTMLFormElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isUpdatePending, startUpdateTransition] = useTransition();

    if (!client) {
        return (
            <div className="flex items-center justify-center h-full bg-background">
                <p className="text-muted-foreground">Select a client to view their details.</p>
            </div>
        );
    }

    const handleUpdate = (formData: FormData) => {
        const data: UpdateClientFormData = {
            name: formData.get('name') as string,
            companyName: formData.get('companyName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            country: formData.get('country') as string,
            dealValue: formData.get('dealValue') as string,
            currency: formData.get('currency') as string,
            paymentTerms: formData.get('paymentTerms') as string,
            notes: formData.get('notes') as string,
        };

        startUpdateTransition(async () => {
            await updateClient(client.id, data);
            setIsEditing(false);
        });
    };
    
    const triggerUpdate = () => {
        if (editFormRef.current) {
            const formData = new FormData(editFormRef.current);
            handleUpdate(formData);
        }
    };

    const clientInfoDisplay = [
        { icon: <UserIcon className="w-5 h-5 text-muted-foreground" />, label: 'Name', value: client.name },
        { icon: <BuildingIcon className="w-5 h-5 text-muted-foreground" />, label: 'Company', value: client.companyName },
        { icon: <GlobeIcon className="w-5 h-5 text-muted-foreground" />, label: 'Country', value: client.country },
        { icon: <Mail className="w-5 h-5 text-muted-foreground" />, label: 'Email', value: client.email, href: `mailto:${client.email}` },
        { icon: <Phone className="w-5 h-5 text-muted-foreground" />, label: 'Phone', value: client.phone, href: `tel:${client.phone}` },
        { icon: <Currency className="w-5 h-5 text-muted-foreground" />, label: 'Currency', value: client.currency },
        { icon: <BadgeDollarSign className="w-5 h-5 text-muted-foreground" />, label: 'Deal Value', value: client.dealValue },
        { icon: <Calendar className="w-5 h-5 text-muted-foreground" />, label: 'Start Date', value: client.startDate ? client.startDate.toDateString() : null},
    ];

    return (
        // CHANGE 1: The root element is now a <div>, not a <form>.
        // This acts as the main container for the entire profile view.
        <div className="p-6 h-full overflow-y-auto bg-background">
            
            {/* The main "edit client" form starts here. */}
            <form ref={editFormRef}>
                <header className="mb-8 flex justify-between items-start">
                    <div>
                        <button onClick={onBack} type="button" className="md:hidden flex items-center mb-4 text-sm font-semibold text-muted-foreground hover:text-foreground">
                            <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to list
                        </button>
                        {isEditing ? (
                            <input type="text" name="name" defaultValue={client.name} required className="text-3xl font-bold bg-transparent border-b-2 border-input focus:border-primary focus:outline-none" />
                        ) : (
                            <h1 className="text-3xl font-bold text-foreground">{client.name}</h1>
                        )}
                        {isEditing ? (
                            <input type="text" name="companyName" defaultValue={client.companyName ?? ''} className="text-muted-foreground bg-transparent border-b border-input focus:border-primary focus:outline-none text-sm mt-1" />
                        ) : (
                            <p className="text-muted-foreground">{client.companyName}</p>
                        )}
                        <div className="mt-2">
                            <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusColor(client.status)}`}>{client.status.replace('_', ' ')}</span>
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
                            <button type="button" onClick={() => setIsEditing(true)} className="p-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                <Edit className="h-5 w-5"/>
                            </button>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Client Details</h3>
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="text-xs text-muted-foreground block mb-1">Email</label><input type="email" name="email" defaultValue={client.email} required className="w-full bg-background border border-input rounded-md p-2 text-sm" /></div>
                                    <div><label className="text-xs text-muted-foreground block mb-1">Phone</label><input type="text" name="phone" defaultValue={client.phone ?? ''} className="w-full bg-background border border-input rounded-md p-2 text-sm" /></div>
                                    <div><label className="text-xs text-muted-foreground block mb-1">Country</label><input type="text" name="country" defaultValue={client.country ?? ''} className="w-full bg-background border border-input rounded-md p-2 text-sm" /></div>
                                    <div><label className="text-xs text-muted-foreground block mb-1">Deal Value</label><input type="number" name="dealValue" defaultValue={client.dealValue ?? ''} className="w-full bg-background border border-input rounded-md p-2 text-sm" /></div>
                                    <div><label className="text-xs text-muted-foreground block mb-1">Currency</label><input type="text" name="currency" defaultValue={client.currency ?? ''} className="w-full bg-background border border-input rounded-md p-2 text-sm" /></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {clientInfoDisplay.map(item => item.value && (
                                        <div key={item.label} className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">{item.icon}</div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">{item.label}</p>
                                                {item.href ? (
                                                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                        <Card>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Client Notes</h3>
                            {isEditing ? (
                                <textarea name="notes" defaultValue={client.notes ?? ''} rows={4} className="w-full bg-background border border-input rounded-md p-2 text-sm" />
                            ) : (
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes || 'No notes added.'}</p>
                            )}
                        </Card>
                        {/* CHANGE 2: The <InteractionLog /> component is REMOVED from this location to prevent nesting. */}
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <AIFeatures client={client} />
                        <DocumentVault documents={client.documents} clientId={client.id}/>
                        <Card>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Payment Terms</h3>
                            {isEditing ? (
                                <select name="paymentTerms" defaultValue={client.paymentTerms} className="w-full bg-background border border-input rounded-md p-2 text-sm">
                                    {PaymentTermsOptions.map(term => (
                                        <option key={term} value={term}>{term.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-sm text-muted-foreground">{client.paymentTerms.replace('_', ' ')}</p>
                            )}
                        </Card>
                    </div>
                </div>
            </form> {/* The "edit client" form ends here */}

            {/* CHANGE 3: The InteractionLog is now rendered OUTSIDE the main form. */}
            {/* It's placed in its own container to ensure it's not a descendant, fixing the error. */}
            <div className="mt-6">
                <InteractionLog interactions={client.interactionLogs} clientId={client.id} />
            </div>
        </div>
    );
};

const AIFeatures: React.FC<{ client: ClientWithDetails }> = ({ client }) => (
    <Card className="bg-secondary">
        <div className="flex items-center space-x-2 mb-4">
            <SparklesIcon className="w-6 h-6 text-primary"/>
            <h3 className="text-lg font-semibold text-secondary-foreground">AI Assistant</h3>
        </div>
        <div className="space-y-4">
            {/* AI features like follow-up suggestions can be added here */}
            <p className="text-sm text-muted-foreground">AI features and insights for this client will appear here.</p>
            
        </div>
    </Card>
);

const InteractionLog: React.FC<{ interactions: PrismaInteractionLog[], clientId: string }> = ({ interactions, clientId }) => { 
    const logFormRef = useRef<HTMLFormElement>(null);
    const [isLogPending, startLogTransition] = useTransition();

    // This function is now the action for the form.
    // It's wrapped in a transition to provide pending UI state.
    const handleLogSubmit = (formData: FormData) => {
        startLogTransition(async () => {
            await addInteractionLogClient(formData);
            logFormRef.current?.reset();
        });
    };

    const handleDeleteLog = (logId: string) => {
        startLogTransition(async () => {
            await deleteInteractionLogClient(logId);
            logFormRef.current?.reset();
        });
    }
    
    return (
        <Card>
            <h3 className="text-lg font-semibold text-foreground mb-4">Interaction Timeline</h3>
            <div className="space-y-6">
                {interactions.map(log => (
                    <div key={log.id} className="flex space-x-4 w-full  justify-between items-center">
                        <div className='flex space-x-4'>
                            <div className="flex flex-col items-center ">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">{getInteractionIcon(log.type)}</span>
                            {/* Render a line unless it's the last item */}
                            {interactions[interactions.length - 1].id !== log.id && <div className="h-full w-px bg-border"></div>}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <p className="font-semibold text-sm">{log.type.replace('_', ' ')}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{log.content}</p>
                        </div>
                        </div>
                        <button onClick={() => handleDeleteLog(log.id)} className='text-red-500 bg-red-100 p-1.5 hover:scale-110 transition rounded-md cursor-pointer'><Trash2 size={22}/></button>
                    </div>
                ))}
                {/* New Interaction Form */}
                <div className="flex space-x-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Plus/></span>
                    <form
  onSubmit={(e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    handleLogSubmit(formData);
  }}
  ref={logFormRef}
  className="flex-1"
>
                        <input type="hidden" name="clientId" value={clientId} />
                        <div className="rounded-md border border-input">
                            <textarea name="content" placeholder="Log a new interaction..." required className="w-full p-2 bg-transparent text-sm focus:outline-none resize-none"></textarea>
                            <div className="flex justify-between items-center border-t bg-muted/50 p-2">
                                <select name="type" defaultValue="NOTE_ADDED" className="bg-transparent text-xs focus:outline-none">
                                    <option value="NOTE_ADDED">Note</option>
                                    <option value="EMAIL_SENT">Email Sent</option>
                                    <option value="PHONE_CALL">Phone Call</option>
                                    <option value="MEETING">Meeting</option>
                                </select>
                                <button type="submit" disabled={isLogPending} className="px-3 py-1 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                                    {isLogPending ? 'Logging...' : 'Log'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Card>
    );
};

// Update the props to include clientId
interface DocumentVaultProps {
  documents: PrismaDocumentVault[];
  clientId: string;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({ documents, clientId }) => {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

 // CHANGE 1: The handler now accepts the React Form Event
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // CHANGE 2: Prevent the default browser submission (the page reload)
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await uploadDocument(formData);
      if (result.success) {
        formRef.current?.reset();
      } else {
        alert(result.message);
      }
    });
  };

  return (
    <Card className="p-6"> {/* Added padding for better spacing */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">Document Vault</h3>
      </div>

      {/* Upload Form */}
      <form ref={formRef} onSubmit={handleFormSubmit} className="mb-6 p-4 border rounded-lg bg-muted/30">
        <input type="hidden" name="clientId" value={clientId} />
        <div className="flex flex-col  items-center gap-4">
          <input
            type="file"
            name="file"
            required
            className="flex-grow w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>

      {/* Document List */}
      <div className="space-y-2">
        {documents.length > 0 ? (
          documents.map(doc => (
            <div key={doc.id} className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
              <div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">{doc.name}</a>
                <p className="text-xs text-muted-foreground">{doc.type} - {new Date(doc.createdAt).toLocaleDateString()}</p>
              </div>
              {/* Optional: Add a delete button here */}
            </div>
          ))
        ) : (
          <p className="text-sm text-center text-muted-foreground py-4">No documents uploaded yet.</p>
        )}
      </div>
    </Card>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
interface ClientsDashboardProps {
    initialClients: ClientWithDetails[];
}

export default function ClientsDashboard({ initialClients }: ClientsDashboardProps) {
    const [clients, setClients] = useState<ClientWithDetails[]>(initialClients);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClients[0]?.id ?? null);
    const [isProfileVisible, setIsProfileVisible] = useState(false);

    // 👇 FIX 1: ADD THIS useEffect TO SYNC PROPS WITH STATE
    // This hook listens for changes to the `initialClients` prop (which happens after
    // a server action revalidates the page) and updates the component's internal state.
    useEffect(() => {
        setClients(initialClients);
    }, [initialClients]);

     // 👇 FIX 2: ADD THIS useEffect TO HANDLE SELECTION CHANGES
    // This ensures that if the selected client is removed, the selection resets gracefully.
    useEffect(() => {
        const currentClientExists = clients.some(c => c.id === selectedClientId);
        if (!currentClientExists) {
            setSelectedClientId(clients[0]?.id ?? null);
        }
    }, [clients, selectedClientId]);


    // 👇 1. ADD STATE FOR FILTERS AND MODAL
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupBy, setGroupBy] = useState<'country' | 'status' | null>('status');
    const [dealValueFilter, setDealValueFilter] = useState<number>(0);
    const [currencyFilter, setCurrencyFilter] = useState<string>('all');

    // 👇 2. ADD MEMOIZED LOGIC FOR FILTERING AND GROUPING
    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            (client.dealValue ? client.dealValue >= dealValueFilter : true) &&
            (currencyFilter === 'all' || client.currency === currencyFilter)
        );
    }, [clients, dealValueFilter, currencyFilter]);

    const groupedClients = useMemo(() => {
        if (!groupBy) return { 'All Clients': filteredClients };

        const groups = filteredClients.reduce((acc, client) => {
            const key = client[groupBy] || 'Unknown';
            if (!acc[key]) acc[key] = [];
            acc[key].push(client);
            return acc;
        }, {} as Record<string, ClientWithDetails[]>);

        return Object.keys(groups).length > 0 ? groups : { [`No clients match filter`]: [] };
    }, [filteredClients, groupBy]);

    const selectedClient = useMemo(() => {
        return clients.find(c => c.id === selectedClientId) ?? null;
    }, [selectedClientId, clients]);

    const handleSelectClient = (id: string) => {
        setSelectedClientId(id);
        setIsProfileVisible(true);
    };
    
    const handleBackToList = () => {
        setIsProfileVisible(false);
    };

     // 👇 3. PREPARE PROPS FOR THE ClientList COMPONENT
    const currencies = ['all', ...Array.from(new Set(clients.map(c => c.currency).filter(Boolean))) as string[]];
    const filterProps = { groupBy, setGroupBy, dealValueFilter, setDealValueFilter, currencyFilter, setCurrencyFilter, currencies };

    return (
        <main className="h-screen w-full bg-background font-sans flex flex-col antialiased">
            <div className="flex-grow md:grid md:grid-cols-4 min-h-0">
                <aside className={`md:col-span-1 h-full ${isProfileVisible ? 'hidden' : 'block'} md:block`}>
                    <ClientList 
                        groupedClients={groupedClients} 
                        selectedClientId={selectedClientId} 
                        onSelectClient={handleSelectClient} 
                        filters={filterProps}
                        onOpenCreateModal={() => setIsModalOpen(true)}
                    />
                </aside>
                <section className={`md:col-span-3 min-w-0 h-full ${isProfileVisible ? 'block' : 'hidden'} md:block`}>
                    <ClientProfile client={selectedClient} onBack={handleBackToList} />
                </section>
            </div>
            {/* You would also add your CreateClientModal here */}
            {/* <CreateClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> */}
        </main>
    );
}
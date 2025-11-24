// app/knowledge-hub/KnowledgeHubClientPage.tsx

'use client';

import React, { useState, useMemo, useEffect, useTransition} from 'react';
import { createResource, deleteResource } from '@/actions/knowledgeHubActions';

import { KnowledgeHub } from '@/lib/generated/prisma'

// --- TYPESCRIPT INTERFACE ---
type ResourceType = 'SOP' | 'Email Template' | 'Code Snippet' | 'Design Resource';

// --- SVG ICONS ---
const SearchIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const DocumentIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const MailIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
const CodeIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>);
const BrushIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const PlusIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>);
const XIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const ClipboardIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const CheckIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const AlertTriangleIcon = ({ className = "w-6 h-6" }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>);

const getIconForType = (type: string, className: string = "w-5 h-5") => {
    switch (type) {
        case 'SOP': return <DocumentIcon className={className} />;
        case 'Email Template': return <MailIcon className={className} />;
        case 'Code Snippet': return <CodeIcon className={className} />;
        case 'Design Resource': return <BrushIcon className={className} />;
        default: return <DocumentIcon className={className} />;
    }
};

// --- HELPER COMPONENTS ---
const AddResourceModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [isPending, startTransition] = useTransition();
    const [type, setType] = useState<ResourceType>('SOP');
    
    const handleSubmit = (formData: FormData) => {
        const data = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            type: formData.get('type') as string,
            tags: (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean),
            content: formData.get('content') as string,
            url: formData.get('type') === 'Design Resource' ? formData.get('url') as string : null,
        };

        startTransition(async () => {
            const result = await createResource(data);
            if (result.success) {
                onClose();
            } else {
                alert(result.message);
            }
        });
    };
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-card-foreground">Add New Resource</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><XIcon className="w-6 h-6" /></button>
                </header>
                <form action={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Title</label>
                        <input name="title" type="text" required className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <input name="description" type="text" required className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                        <select name="type" value={type} onChange={(e) => setType(e.target.value as ResourceType)} className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-ring appearance-none">
                            <option value="SOP">SOP</option>
                            <option value="Email Template">Email Template</option>
                            <option value="Code Snippet">Code Snippet</option>
                            <option value="Design Resource">Design Resource</option>
                        </select>
                    </div>
                    {type === 'Design Resource' && (
                         <div>
                             <label className="text-sm font-medium text-muted-foreground">URL</label>
                             <input name="url" type="url" placeholder="https://example.com" className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-ring" />
                         </div>
                    )}
                     <div>
                         <label className="text-sm font-medium text-muted-foreground">Tags (comma-separated)</label>
                         <input name="tags" type="text" className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-ring" />
                     </div>
                     <div>
                         <label className="text-sm font-medium text-muted-foreground">Content</label>
                         <textarea name="content" required rows={8} className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-foreground focus:ring-2 focus:ring-ring font-mono text-sm"></textarea>
                     </div>
                     <footer className="p-4 border-t border-border flex justify-end">
                        <button type="submit" disabled={isPending} className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                          {isPending ? 'Saving...' : 'Save Resource'}
                        </button>
                     </footer>
                </form>
            </div>
        </div>
    );
};

const ResourceModal: React.FC<{ resource: KnowledgeHub | null; onClose: () => void; onDelete: (resource: KnowledgeHub) => void; }> = ({ resource, onClose, onDelete }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!resource) return;
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [resource, onClose]);

    if (!resource) return null;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(resource.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        {getIconForType(resource.type, "w-6 h-6 text-muted-foreground")}
                        <h2 className="text-lg font-semibold text-card-foreground">{resource.title}</h2>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto flex-1">
                    <p className="text-muted-foreground mb-4">{resource.description}</p>
                    {resource.url && (
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-block bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-md mb-4 hover:bg-primary/90 transition-colors">
                            Open Link
                        </a>
                    )}
                    <div className="bg-muted rounded-lg p-4 prose prose-invert prose-sm max-w-none text-muted-foreground">
                        <pre className="bg-transparent p-0 m-0 whitespace-pre-wrap"><code className="font-mono">{resource.content}</code></pre>
                    </div>
                </main>
                <footer className="p-4 border-t border-border flex items-center gap-3">
                    <button onClick={() => onDelete(resource)} className="w-auto bg-red-600/10 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-600/20 transition-colors">
                        Delete
                    </button>
                    <button 
                        onClick={copyToClipboard}
                        className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
                        disabled={copied}
                    >
                        {copied ? <><CheckIcon className="w-5 h-5 text-green-400" /> Copied!</> : <><ClipboardIcon className="w-5 h-5" /> Copy Content</>}
                    </button>
                </footer>
            </div>
        </div>
    );
};

const DeleteConfirmModal: React.FC<{ resource: KnowledgeHub | null; onClose: () => void; onConfirm: () => void; isPending: boolean; }> = ({ resource, onClose, onConfirm, isPending }) => {
    if (!resource) return null;
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="flex items-start space-x-4">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-card-foreground">Delete Resource</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Are you sure you want to delete &apos;<strong>{resource.title}</strong>&apos;? This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="bg-muted text-muted-foreground font-semibold py-2 px-4 rounded-md hover:bg-accent transition-colors">
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={isPending} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-500 transition-colors disabled:opacity-50">
                        {isPending ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResourceCard: React.FC<{ resource: KnowledgeHub; onSelect: (resource: KnowledgeHub) => void }> = ({ resource, onSelect }) => (
    <div onClick={() => onSelect(resource)} className="cursor-pointer group">
        <div className="bg-card border border-border rounded-lg p-4 h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
            <div className="flex items-start space-x-4">
                <div className="bg-muted text-muted-foreground rounded-md p-2 mt-1">
                    {getIconForType(resource.type)}
                </div>
                <div>
                    <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                </div>
            </div>
        </div>
    </div>
);

// --- MAIN PAGE COMPONENT ---
export default function KnowledgeHubClientPage({ initialResources }: { initialResources: KnowledgeHub[] }) {
    const resources = initialResources;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
    const [selectedResource, setSelectedResource] = useState<KnowledgeHub | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState<KnowledgeHub | null>(null);
    const [isDeletePending, startDeleteTransition] = useTransition();

    const filteredResources = useMemo(() => {
        let items = resources;
        if (selectedCategory !== 'All') {
            items = items.filter(r => r.type === selectedCategory);
        }
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            items = items.filter(r =>
                r.title.toLowerCase().includes(lowercasedTerm) ||
                r.description.toLowerCase().includes(lowercasedTerm) ||
                r.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
            );
        }
        return items;
    }, [searchTerm, selectedCategory, resources]);

    const handleOpenDeleteModal = (resource: KnowledgeHub) => {
        setSelectedResource(null);
        setResourceToDelete(resource);
    };

    const handleConfirmDelete = () => {
        if (!resourceToDelete) return;
        startDeleteTransition(async () => {
            await deleteResource(resourceToDelete.id);
            setResourceToDelete(null);
        });
    };

    const categories: ('All' | string)[] = ['All', ...Array.from(new Set(resources.map(r => r.type)))];

    return (
        <div className="bg-background text-foreground min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <main className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Knowledge Hub</h1>
                    <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Your central repository for documents, templates, and team resources.
                    </p>
                </header>

                <div className="mb-10">
                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            placeholder='Ask a question, e.g., "Show me the Shopify setup checklist"...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-input border-border rounded-full text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <aside className="md:col-span-3">
                        <div className="sticky top-8">
                            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center w-full bg-primary text-primary-foreground font-semibold py-2.5 px-4 rounded-lg mb-6 hover:bg-primary/90 transition-colors shadow">
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Add Resource
                            </button>
                            <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-3">Categories</h2>
                            <div className="space-y-1">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            selectedCategory === category
                                                ? 'bg-accent text-accent-foreground'
                                                : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <section className="md:col-span-9">
                        {filteredResources.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredResources.map(resource => (
                                    <ResourceCard key={resource.id} resource={resource} onSelect={setSelectedResource} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-card rounded-lg border border-border">
                                <DocumentIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-lg font-medium text-card-foreground">No Resources Found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Try adjusting your search or category filters.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <ResourceModal 
                resource={selectedResource} 
                onClose={() => setSelectedResource(null)} 
                onDelete={handleOpenDeleteModal} 
            />
            
            <AddResourceModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
            />
            
            <DeleteConfirmModal 
                resource={resourceToDelete}
                onClose={() => setResourceToDelete(null)}
                onConfirm={handleConfirmDelete}
                isPending={isDeletePending}
            />
        </div>
    );
}
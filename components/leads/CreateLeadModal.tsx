// app/leads/CreateLeadModal.tsx

'use client';

import { useState, useTransition } from 'react';
import { createLead, LeadFormData } from '@/actions/leads';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

export default function CreateLeadModal({ isOpen, onClose }: CreateLeadModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    const data: LeadFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      companyName: formData.get('companyName') as string,
      industry: formData.get('industry') as string,
      country: formData.get('country') as string,
      dealValue: formData.get('dealValue') as string,
      currency: formData.get('currency') as string,
      projectSummary: formData.get('projectSummary') as string,
      contactNotes: formData.get('contactNotes') as string,
    };

    setError(null);
    startTransition(async () => {
      const result = await createLead(data);
      if (result.success) {
        onClose(); // Close modal on success
      } else {
        setError(result.message || 'An unexpected error occurred.');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div className="bg-card text-card-foreground rounded-lg border border-border shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <XIcon />
        </button>
        <h2 className="text-2xl font-bold mb-4">Create New Lead</h2>
        
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-muted-foreground">Full Name</label>
              <input type="text" name="name" id="name" required className="mt-1 block w-full bg-background border border-border rounded-md p-2" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email</label>
              <input type="email" name="email" id="email" required className="mt-1 block w-full bg-background border border-border rounded-md p-2" />
            </div>
          </div>
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-muted-foreground">Company Name</label>
            <input type="text" name="companyName" id="companyName" required className="mt-1 block w-full bg-background border border-border rounded-md p-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-muted-foreground">Industry</label>
              <select name="industry" id="industry" required className="mt-1 block w-full bg-background border border-border rounded-md p-2">
                <option>Tech</option>
                <option>Healthcare</option>
                <option>Finance</option>
                <option>E-commerce</option>
                <option>Manufacturing</option>
              </select>
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-muted-foreground">Country</label>
              <input type="text" name="country" id="country" required className="mt-1 block w-full bg-background border border-border rounded-md p-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dealValue" className="block text-sm font-medium text-muted-foreground">Deal Value</label>
              <input type="number" name="dealValue" id="dealValue" required placeholder="25000" className="mt-1 block w-full bg-background border border-border rounded-md p-2" />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-muted-foreground">Currency</label>
              <select name="currency" id="currency" required className="mt-1 block w-full bg-background border border-border rounded-md p-2">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>JPY</option>
                <option>INR</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="projectSummary" className="block text-sm font-medium text-muted-foreground">Project Summary</label>
            <textarea name="projectSummary" id="projectSummary" rows={3} required className="mt-1 block w-full bg-background border border-border rounded-md p-2" />
          </div>
          <div>
            <label htmlFor="contactNotes" className="block text-sm font-medium text-muted-foreground">Contact Notes (one per line)</label>
            <textarea name="contactNotes" id="contactNotes" rows={3} className="mt-1 block w-full bg-background border border-border rounded-md p-2" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-muted text-muted-foreground hover:bg-accent">Cancel</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed">
              {isPending ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
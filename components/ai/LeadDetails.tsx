"use client";

import { Lead } from '@/lib/generated/prisma';
import Link from 'next/link';

// Helper to format currency
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Helper for stage badge color
const getStageBadgeColor = (stage: string) => {
    switch (stage.toLowerCase()) {
        case 'qualified': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50';
        case 'proposal sent': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50';
        case 'new': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600/50';
        case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50';
        default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600/50';
    }
};

// Icons
const EmailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-muted-foreground"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-muted-foreground"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-muted-foreground"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;


export default function LeadDetailsCard({ details }: {details: Lead}) {
  return (
    <div className="mt-3 border border-border rounded-lg bg-card/50 text-sm overflow-hidden">
        <div className="p-4">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-card-foreground">{details.name}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStageBadgeColor(details.leadStage)}`}>
                    {details.leadStage}
                </span>
            </div>

            <div className="mt-2 text-2xl font-light text-foreground">{formatCurrency(details.dealValue)}</div>
            
            <div className="mt-4 space-y-2 text-muted-foreground">
                <div className="flex items-center"><EmailIcon /> <span>{details.email}</span></div>
                <div className="flex items-center"><MapPinIcon /> <span>{details.country}</span></div>
                <div className="flex items-center"><CalendarIcon /> <span>Last Contact: {details.lastContacted.toISOString()}</span></div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Summary</h4>
                <p className="mt-1 text-foreground/90 italic">{details.projectSummary}</p>
            </div>
        </div>

        <div className="bg-muted/50 p-2 text-center dark:bg-background/50">
            <Link href={`/leads/${details.id}`} className="text-xs font-semibold text-primary hover:underline">
                View Full Profile →
            </Link>
        </div>
    </div>
  );
}
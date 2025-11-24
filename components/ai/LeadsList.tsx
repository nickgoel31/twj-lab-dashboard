// src/components/ai/LeadsList.tsx

"use client";

import Link from 'next/link';
import { MapPinIcon } from 'lucide-react';
import { Lead } from '@/lib/generated/prisma';

interface LeadsListProps {
  leads: Lead[];
}


export default function LeadsList({ leads }: LeadsListProps) {
  return (
    <div className="mt-3 border border-border rounded-lg bg-card/50 overflow-hidden">
        {/* If no leads are found, show a helpful message */}
        {leads.length === 0 ? (
            <p className="p-4 text-sm text-center text-muted-foreground">
                No leads found for this filter.
            </p>
        ) : (
            <ul className="divide-y divide-border">
                {leads.map((lead) => (
                <li key={lead.id}>
                    <Link 
                    href={`/leads/${lead.id}`}
                    className="flex items-center p-3 hover:bg-accent transition-colors duration-150 group"
                    >
                    <div className="flex-1">
                        <p className="font-medium text-sm text-foreground group-hover:text-accent-foreground flex items-center">{lead.name}</p>
                        {/* 👇 Display the stage and new location */}
                        <div className="flex items-center text-xs text-muted-foreground group-hover:text-accent-foreground/80 mt-1">
                            <span className="mr-3">{lead.leadStage}</span>
                            <MapPinIcon />
                            <span>{lead.country}</span>
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground ml-4 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </Link>
                </li>
                ))}
            </ul>
        )}
    </div>
  );
}
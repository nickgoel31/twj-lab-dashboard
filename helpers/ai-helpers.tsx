// src/helpers/ai-helpers.ts

import { Lead } from "@/lib/generated/prisma";
import { getLeadsFromDb } from "./db/get-fns";

export interface LeadSummary {
  id: number;
  name: string;
  stage: string;
  location: string; // 👈 Add location property
}

// 👇 The function now accepts an optional location parameter
export async function getLeads(location?: string): Promise<Lead[]> {
  const ALL_LEADS: Lead[] = await getLeadsFromDb();
  console.log(`TOOL CALLED: getLeads(location: ${location})`);
  
  if (location) {
    // If a location is provided, filter the leads (case-insensitive)
    const filteredLeads = ALL_LEADS.filter(lead => 
      lead.country.toLowerCase() === location.toLowerCase()
    );
    return filteredLeads;
  }
  
  // If no location, return all leads as before
  return ALL_LEADS;
}

// 3. CREATE THE NEW FUNCTION TO GET DETAILS FOR ONE LEAD
export async function getLeadDetails(leadName: string): Promise<Lead | null> {
  const ALL_LEADS: Lead[] = await getLeadsFromDb();
    console.log(`TOOL CALLED: getLeadDetails(leadName: ${leadName})`);
    
    const lead = ALL_LEADS.find(l => 
        l.name.toLowerCase() === leadName.toLowerCase()
    );

    return lead || null; // Return the found lead or null if not found
}
// app/leads/page.tsx

import { fetchLeads } from '@/actions/leads'; // Assuming actions are in app/actions/leadActions.ts
import LeadsDashboard from '@/components/leads/LeadsDashboard';

export default async function LeadsPage() {
  // 1. Fetch data on the server
  const initialLeads = await fetchLeads();

  return (
    // 2. Pass the fetched data as a prop to the client component
    <LeadsDashboard initialLeads={initialLeads} />
  );
}
// app/knowledge-hub/page.tsx

import { fetchResources } from '@/actions/knowledgeHubActions';
import KnowledgeHubClientPage from '@/components/knowledge-hub/KnowledgeHubClientPage';

export default async function KnowledgeHubPage() {
  // 1. Fetch data on the server before the page loads
  const initialResources = await fetchResources();

  // 2. Render the client component and pass the data as a prop
  return (
    <KnowledgeHubClientPage initialResources={initialResources} />
  );
}
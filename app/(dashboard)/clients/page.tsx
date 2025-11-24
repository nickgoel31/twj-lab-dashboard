import { getClients } from "@/actions/clients";
import ClientsDashboard from "@/components/clients/ClientsDashboard";

export default async function ClientsPage() {
  // 1. Fetch data on the server when the page is requested
  const initialClients = await getClients();

  return (
    // 2. Pass the real data to the interactive client component as a prop
    <ClientsDashboard initialClients={initialClients} />
  );
}
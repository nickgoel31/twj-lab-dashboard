// /lib/clientsData.ts
export type Client = {
  id: string;
  name: string;
  email?: string;
  company?: string;
};

export const getInitialClients = (): Client[] => [
  { id: "c1", name: "Acme Corp", email: "billing@acme.corp", company: "Acme Corp" },
  { id: "c2", name: "London Café", email: "owner@londoncafe.uk", company: "London Café" },
  { id: "c3", name: "Pixel Studios", email: "finance@pixelstudios.com", company: "Pixel Studios" },
];

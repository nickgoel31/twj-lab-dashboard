// /lib/financeData.ts
export type Currency = "USD" | "EUR" | "GBP" | "INR";
export type InvoiceStatus = "Draft" | "Pending" | "Paid" | "Overdue";

export interface Invoice {
  id: string;
  title: string;
  clientId?: string | null;      // linked client id
  clientName: string;           // fallback or display name
  amount: number;               // base amount (no GST)
  gst?: number | null;          // percentage (e.g. 18)
  currency: Currency;
  status: InvoiceStatus;
  dueDate?: string | null;      // ISO date
  notes?: string;
  createdAt: string;            // ISO
  paidAt?: string | null;
  remindersSent?: number;
}

export function getInitialInvoices(): Invoice[] {
  return [
    {
      id: "inv_1001",
      title: "Website redesign - Phase 1",
      clientId: "c1",
      clientName: "Acme Corp",
      amount: 4500,
      gst: 0,
      currency: "USD",
      status: "Pending",
      dueDate: "2025-09-25",
      notes: "50% upfront invoiced earlier",
      createdAt: "2025-09-01",
      remindersSent: 0
    },
    {
      id: "inv_1002",
      title: "Mobile app MVP",
      clientId: "c3",
      clientName: "Pixel Studios",
      amount: 8000,
      gst: 0,
      currency: "GBP",
      status: "Draft",
      dueDate: null,
      notes: "",
      createdAt: "2025-09-05",
      remindersSent: 0
    }
  ];
}

export const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "INR"];

/** Helpers */
export function formatCurrency(amount: number, currency: Currency) {
  // Very light formatting — user locale left to the project if needed
  return `${currency} ${Number(amount).toLocaleString()}`;
}
export function formatDateISO(date?: string | null) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString();
}


// Expense Type
export type Expense = {
  id: string
  title: string
  amount: number
  category: "Hosting" | "Software" | "Contractor" | "Marketing" | "Misc"
  date: string   // ISO date string: "YYYY-MM-DD"
}

// ✅ Starter mock data
export const mockExpenses: Expense[] = [
  {
    id: "exp_1001",
    title: "AWS Hosting",
    amount: 79.99,
    category: "Hosting",
    date: "2025-09-01",
  },
  {
    id: "exp_1002",
    title: "Figma Subscription",
    amount: 45.0,
    category: "Software",
    date: "2025-09-03",
  },
  {
    id: "exp_1003",
    title: "Freelance Designer",
    amount: 500,
    category: "Contractor",
    date: "2025-09-05",
  },
  {
    id: "exp_1004",
    title: "Google Ads Campaign",
    amount: 120,
    category: "Marketing",
    date: "2025-09-08",
  },
  {
    id: "exp_1005",
    title: "Office Snacks",
    amount: 25.5,
    category: "Misc",
    date: "2025-09-10",
  },
]

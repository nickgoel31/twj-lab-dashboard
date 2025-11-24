"use client";

import React from 'react';

// Define interfaces for your data structures
interface Invoice {
  client: string;
  amount: string;
  dueDate: string;
  isOverdue?: boolean;
}

// You can add more interfaces for Projects, Leads, etc.

interface ToolResultProps {
  toolUsed: string;
  data: any; // The raw data from your server action
}

const ToolResult: React.FC<ToolResultProps> = ({ toolUsed, data }) => {
  // Render a different component based on which tool was used
  switch (toolUsed) {
    case 'getInvoices':
      const invoices = data.invoices as Invoice[];
      return (
        <div className="mt-2 border border-border rounded-lg bg-card/50 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 font-medium">Client</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={index} className="border-t border-border">
                  <td className="px-4 py-2">{invoice.client}</td>
                  <td className="px-4 py-2">{invoice.amount}</td>
                  <td className={`px-4 py-2 ${invoice.isOverdue ? 'text-red-400' : ''}`}>
                    {invoice.dueDate} {invoice.isOverdue ? '(Overdue)' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    
    // Add more cases here for your other tools
    // case 'getProjectUpdates':
    //   return <ProjectUpdateList updates={data.updates} />

    default:
      return null;
  }
};

export default ToolResult;
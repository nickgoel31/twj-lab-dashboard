// app/actions/leadActions.ts

'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Lead, Note, InteractionLogLead, InteractionType } from '@/lib/generated/prisma';

// 1. UPDATED TYPE: Now includes both notes and interaction logs for full type safety
export type LeadWithDetails = Lead & { 
  contactNotes: Note[],
  interactionLogs: InteractionLogLead[] 
};

// This type defines the shape of our form data
export type LeadFormData = {
  name: string;
  email: string;
  companyName: string;
  industry: string;
  country: string;
  dealValue: string; // Comes from form as string
  currency: string;
  projectSummary: string;
  contactNotes: string; // Comes from a textarea
};

// 2. UPDATED FUNCTION: Fetches the lead along with both related models
export async function fetchLeads(): Promise<LeadWithDetails[]> {
  return await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      contactNotes: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      // --- NEW ---
      // Also include the new interaction logs, sorted chronologically
      interactionLogs: {
        
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
  });
}

// 3. UPDATED FUNCTION: Now creates an initial interaction log when a lead is created
export async function createLead(data: LeadFormData) {
  try {
    const notesToCreate = data.contactNotes
      .split('\n')
      .filter((note) => note.trim() !== '');

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.companyName, // <-- CORRECTED field name
        industry: data.industry,
        country: data.country,
        dealValue: parseInt(data.dealValue, 10) || 0,
        currency: data.currency,
        projectSummary: data.projectSummary,
        leadStage: 'NEW',
        lastContacted: new Date(),
        leadScore: Math.floor(Math.random() * (85 - 65 + 1)) + 65,
        contactNotes: {
          create: notesToCreate.map((noteContent) => ({ content: noteContent })),
        },
        // --- NEW ---
        // Automatically create the first interaction log for this lead
        interactionLogs: {
          create: {
            type: 'NOTE_ADDED', // Or another suitable InteractionType from your enum
            content: `Lead created. Initial summary: ${data.projectSummary}`,
          }
        }
      },
    });

    revalidatePath('/leads');
    return { success: true, lead };
  } catch (error) {
    console.error('Failed to create lead:', error);
    return { success: false, message: 'Failed to create lead.' };
  }
}

export type UpdateLeadFormData = Omit<LeadFormData, 'email'>;

export async function updateLead(id: number, data: UpdateLeadFormData) {
  try {
    const notesToCreate = data.contactNotes
      .split('\n')
      .filter((note) => note.trim() !== '');

    const result = await prisma.$transaction([
      prisma.note.deleteMany({
        where: { leadId: id },
      }),
      prisma.lead.update({
        where: { id },
        data: {
          name: data.name,
          // CORRECTED: Use companyName to match your schema
          company: data.companyName,
          industry: data.industry,
          country: data.country,
          dealValue: parseInt(data.dealValue, 10) || 0,
          currency: data.currency,
          projectSummary: data.projectSummary,
          contactNotes: {
            create: notesToCreate.map((content) => ({ content })),
          },
        },
      }),
    ]);
    
    revalidatePath('/leads');
    return { success: true, lead: result[1] };
  } catch (error) {
    console.error('Failed to update lead:', error);
    return { success: false, message: 'Failed to update lead.' };
  }
}

export async function deleteLead(id: number) {
  try {
    await prisma.lead.delete({
      where: { id },
    });
    revalidatePath('/leads');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return { success: false, message: 'Failed to delete lead.' };
  }
}

export async function addInteractionLog(formData: FormData) {
  const leadId = parseInt(formData.get('leadId') as string, 10);
  const type = formData.get('type') as InteractionType;
  const content = formData.get('content') as string;

  if (!leadId || !type || !content) {
    return { success: false, message: 'Missing required fields.' };
  }

  try {
    // When a new interaction is logged, also update the lead's lastContacted date
    await prisma.$transaction([
      prisma.interactionLogLead.create({
        data: {
          leadId,
          type,
          content,
        },
      }),
      prisma.lead.update({
        where: { id: leadId },
        data: {
          lastContacted: new Date(),
        },
      }),
    ]);
    
    revalidatePath('/leads');
    return { success: true };
  } catch (error) {
    console.error('Failed to add interaction log:', error);
    return { success: false, message: 'Database error.' };
  }
}


export async function convertToClient(leadId: number) {
  try {
    // A transaction ensures that both creating the client and deleting the lead
    // either both succeed or both fail, preventing data inconsistency.
    const newClient = await prisma.$transaction(async (tx) => {
      // 1. Find the lead to ensure it exists
      const lead = await tx.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        throw new Error('Lead not found.');
      }

      // 2. Create a new client using the data from the lead
      const createdClient = await tx.currentClient.create({
        data: {
          name: lead.name,
          companyName: lead.company,
          email: lead.email,
          dealValue: lead.dealValue,
          currency: lead.currency,
          country: lead.country,
          createdAt: new Date(),
          phone: '',
          status: 'ACTIVE',
          startDate: new Date(),
          paymentTerms: 'FIFTY_FIFTY',
          
          // Other fields like 'status' and 'startDate' will use their default values from your Prisma schema
        },
      });

      // 3. Delete the original lead
      await tx.lead.delete({
        where: { id: leadId },
      });

      return createdClient;
    });

    // Revalidate the path to refresh the UI with the updated leads list
    revalidatePath('/leads'); 
    return { success: true, message: `Converted ${newClient.name} to a client.` };

  } catch (error) {
    console.error('Failed to convert lead to client:', error);
    if (error instanceof Error) {
        return { success: false, message: error.message };
    }
    return { success: false, message: 'An unknown error occurred.' };
  }
}
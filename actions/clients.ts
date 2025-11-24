"use server";

import { prisma } from "@/lib/prisma"; // Assuming your Prisma client is here
import { InteractionType, PaymentTerms, Prisma } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";

// This creates a reusable, type-safe query for getting clients with their relations
const clientWithDetailsQuery = Prisma.validator<Prisma.CurrentClientDefaultArgs>()({
  include: { 
    interactionLogs: true, 
    documents: true,

  },
});

// This exports the TypeScript type based on the query above.
// We'll use this in our components to ensure type safety.
export type ClientWithDetails = Prisma.CurrentClientGetPayload<typeof clientWithDetailsQuery>;

/**
 * Fetches all clients from the database including their interaction logs and documents.
 */
export async function getClients(): Promise<ClientWithDetails[]> {
  try {
    const clients = await prisma.currentClient.findMany({
      ...clientWithDetailsQuery, // Use our predefined query
      orderBy: {
        createdAt: 'desc',
      }
    });
    return clients;
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    return []; // Return an empty array on error
  }
}

export interface UpdateClientFormData {
  name: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  dealValue: string; // FormData values are always strings
  currency: string | null;
  paymentTerms: string;
  notes: string | null;
}

export async function updateClient(clientId: string, data: UpdateClientFormData) {
  // --- START OF FIX ---

  // 1. Create a set of valid enum values for a quick runtime check.
  const validPaymentTerms = new Set(Object.values(PaymentTerms));

  // 2. Validate that the string from the form is a valid enum member.
  if (!validPaymentTerms.has(data.paymentTerms as PaymentTerms)) {
    console.error("Invalid payment term provided:", data.paymentTerms);
    return { success: false, message: "Invalid payment term value." };
  }

  // --- END OF FIX ---
  
  try {
    await prisma.currentClient.update({
      where: { id: clientId },
      data: {
        name: data.name,
        companyName: data.companyName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        dealValue: parseFloat(data.dealValue) || null,
        currency: data.currency,
        // 3. Now that the value is validated, Prisma will accept it without issues.
        //    The type assertion is now safe because we've confirmed the value at runtime.
        paymentTerms: data.paymentTerms as PaymentTerms,
        notes: data.notes,
      },
    });

    revalidatePath('/clients');
    return { success: true, message: 'Client updated successfully.' };

  } catch (error) {
    console.error("Failed to update client:", error);
    return { success: false, message: "Failed to update client." };
  }
}

export async function addInteractionLogClient(formData: FormData) {
   const clientId = formData.get('clientId') as string
    const type = formData.get('type') as InteractionType;
    const content = formData.get('content') as string;
  
    if (!clientId || !type || !content) {
      return { success: false, message: 'Missing required fields.' };
    }
  
    try {
      // When a new interaction is logged, also update the client's lastContacted date
      await prisma.$transaction([
        prisma.interactionLog.create({
          data: {
            clientId,
            type,
            content,
          },
        }),
        prisma.currentClient.update({
          where: { id: clientId },
          data: {
            updatedAt: new Date(),
          },
        }),
      ]);
      
      revalidatePath('/clients');
      return { success: true };
    } catch (error) {
      console.error('Failed to add interaction log:', error);
      return { success: false, message: 'Database error.' };
    }
}

export async function deleteInteractionLogClient(logId: string) {
  try {
    await prisma.interactionLog.delete({
      where: { id: logId },
    });
    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete interaction log:', error);
    return { success: false, message: 'Database error.' };
  }
}
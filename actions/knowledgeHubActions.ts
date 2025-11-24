// app/actions/knowledgeHubActions.ts

'use server';

import { prisma } from '@/lib/prisma'; // Assumes you have a prisma singleton instance
import { revalidatePath } from 'next/cache';
import { KnowledgeHub } from '@/lib/generated/prisma';


/**
 * Fetches all resources from the database, ordered by the newest first.
 */
export async function fetchResources(): Promise<KnowledgeHub[]> {
  try {
    const resources = await prisma.knowledgeHub.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return resources;
  } catch (error) {
    console.error('Database Error: Failed to fetch resources.', error);
    return [];
  }
}

/**
 * Creates a new resource in the database.
 */
export async function createResource(data: Omit<KnowledgeHub, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    await prisma.knowledgeHub.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        content: data.content,
        tags: data.tags,
        url: data.url,
      },
    });
    
    // Revalidate the page to show the new resource immediately
    revalidatePath('/knowledge-hub'); // Adjust this path if your page is located elsewhere
    return { success: true };
  } catch (error) {
    console.error('Database Error: Failed to create resource.', error);
    return { success: false, message: 'Failed to create resource.' };
  }
}

export async function deleteResource(id: string) {
  try {
    await prisma.knowledgeHub.delete({
      where: { id },
    });

    revalidatePath('/knowledge-hub'); // Adjust path if needed
    return { success: true };
  } catch (error) {
    console.error('Database Error: Failed to delete resource.', error);
    return { success: false, message: 'Failed to delete resource.' };
  }
}
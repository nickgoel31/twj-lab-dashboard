"use server"

import {prisma} from '@/lib/prisma';

export async function getLeadsFromDb() {
  const leads = await prisma.lead.findMany();
  return leads;
}

export async function getLeadByIdFromDb(id: number) {}
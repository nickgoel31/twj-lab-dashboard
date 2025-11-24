import { PrismaClient } from '@/lib/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`



declare global {
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({ connectionString })


export const prisma = global.prisma ?? new PrismaClient({ log: ['query'], adapter })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

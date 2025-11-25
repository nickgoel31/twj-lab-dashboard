import { PrismaClient } from '@/lib/generated/prisma'
// import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaLibSql as PrismaLibSQL } from '@prisma/adapter-libsql'

const connectionString = `${process.env.DATABASE_URL}`



declare global {
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaLibSQL({
  url: `${process.env.TURSO_DATABASE_URL}`,
  authToken: `${process.env.TURSO_AUTH_TOKEN}`,
})


export const prisma = global.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma
  || new PrismaClient({
    log: ['query'], // Adjust logging level as needed
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma }; // Named export
export default prisma; // Default export

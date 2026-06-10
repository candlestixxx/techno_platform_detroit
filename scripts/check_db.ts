import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.event.count();
  console.log('Event count:', count);
  const events = await prisma.event.findMany({ take: 5 });
  console.log('Sample events:', JSON.stringify(events, null, 2));
}
main().finally(() => prisma.$disconnect());

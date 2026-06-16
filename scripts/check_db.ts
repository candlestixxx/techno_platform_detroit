import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.user.count();
  console.log('User count:', count);
  const users = await prisma.user.findMany({ take: 10 });
  console.log('Sample users:', JSON.stringify(users, null, 2));
}
main().finally(() => prisma.$disconnect());

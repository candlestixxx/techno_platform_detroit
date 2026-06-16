import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create an admin user if not exists
  const admin = await prisma.user.upsert({
    where: { email: 'admin@detroitunderground.com' },
    update: { 
      isAdmin: true,
      password: hashedPassword
    },
    create: {
      email: 'admin@detroitunderground.com',
      name: 'Admin User',
      password: hashedPassword,
      isAdmin: true,
      isApproved: true,
      role: 'ADMIN'
    }
  });
  console.log('Admin user created/updated:', admin.email);

  // Create some flagged posts
  await prisma.post.create({
    data: {
      content: 'This post contains prohibited content!',
      isFlagged: true,
      type: 'TEXT',
      authorId: admin.id
    }
  });

  // Create some flagged events
  await prisma.event.create({
    data: {
      title: 'Suspicious Afterparty',
      date: new Date(),
      venue: 'Unknown Warehouse',
      lineup: '["Secret DJ"]',
      source: 'Manual',
      isFlagged: true
    }
  });

  // Create an unapproved business
  await prisma.user.upsert({
    where: { email: 'newbiz@example.com' },
    update: { isApproved: false },
    create: {
      email: 'newbiz@example.com',
      name: 'New Techno Record Store',
      role: 'BUSINESS',
      isApproved: false
    }
  });

  console.log('Seed data for admin dashboard created.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

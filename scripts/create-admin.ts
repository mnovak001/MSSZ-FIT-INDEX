import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const existingUser = await prisma.user.findUnique({
    where: { username }
  });
  
  if (existingUser) {
    console.log(`User ${username} already exists. Updating password and role.`);
    await prisma.user.update({
      where: { username },
      data: {
        password: hashedPassword,
        role: 'admin'
      }
    });
  } else {
    const adminUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: 'Admin',
        role: 'admin'
      }
    });
    console.log(`Admin user created: ${adminUser.username}`);
  }
  
  await prisma.$disconnect();
}

createAdminUser()
  .catch(console.error)
  .finally(() => process.exit(0));
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    const username = process.argv[2] || 'admin';
    const newPassword = process.argv[3];

    if (!newPassword) {
      console.log('Usage: npx tsx scripts/reset-admin.ts <username> <new-password>');
      console.log('Example: npx tsx scripts/reset-admin.ts admin MyNewPassword123!');
      process.exit(1);
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      console.log(`User "${username}" not found. Creating new admin user...`);
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const newUser = await prisma.user.create({
        data: {
          username,
          name: 'Administrator',
          password: hashedPassword,
          role: 'admin'
        }
      });
      
      console.log(`✅ Admin user "${username}" created successfully!`);
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${newPassword}`);
    } else {
      // Update existing user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword
        }
      });
      
      console.log(`✅ Password for user "${username}" updated successfully!`);
      console.log(`   Username: ${username}`);
      console.log(`   New Password: ${newPassword}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
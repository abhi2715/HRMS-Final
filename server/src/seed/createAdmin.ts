import mongoose from 'mongoose';
import { env } from '../config/env';
import User from '../models/User.model';
import { UserRole } from '../../../shared/types/enums';
import { logger } from '../utils/logger';

/**
 * Admin/CEO provisioning script.
 *
 * Usage:
 *   npx tsx src/seed/createAdmin.ts <email> <password> <firstName> <lastName> [role]
 *
 * Examples:
 *   npx tsx src/seed/createAdmin.ts admin@company.com SecurePass123 Admin User admin
 *   npx tsx src/seed/createAdmin.ts ceo@company.com SecurePass456 John Doe ceo
 *
 * This script:
 * - Connects to MongoDB
 * - Checks if a user with the given email already exists
 * - Creates the user if it doesn't exist
 * - Exits cleanly
 *
 * No fake data. No default credentials. The operator must supply real credentials.
 */

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║              HRMS — Account Provisioning Script              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Usage:                                                      ║
║    npx tsx src/seed/createAdmin.ts \\                         ║
║      <email> <password> <firstName> <lastName> [role]        ║
║                                                              ║
║  Arguments:                                                  ║
║    email      — User email address                           ║
║    password   — Password (min 8 chars, mixed case + number)  ║
║    firstName  — First name                                   ║
║    lastName   — Last name                                    ║
║    role       — Optional: admin (default), ceo               ║
║                                                              ║
║  Examples:                                                   ║
║    npx tsx src/seed/createAdmin.ts \\                         ║
║      admin@company.com SecurePass123 Admin User              ║
║                                                              ║
║    npx tsx src/seed/createAdmin.ts \\                         ║
║      ceo@company.com SecurePass456 John Doe ceo              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `);
    process.exit(1);
  }

  const [email, password, firstName, lastName, roleArg] = args;
  const role = (roleArg === 'ceo' ? UserRole.CEO : UserRole.ADMIN);

  // Validate password
  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters.');
    process.exit(1);
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    console.error('❌ Password must contain at least one uppercase letter, one lowercase letter, and one number.');
    process.exit(1);
  }

  try {
    // Connect to DB
    await mongoose.connect(env.MONGODB_URI);
    logger.info(`Connected to MongoDB: ${env.MONGODB_URI}`);

    // Check if user exists
    const existing = await User.findByEmail(email);
    if (existing) {
      console.log(`\n⚠️  A user with email "${email}" already exists (role: ${existing.role}).`);
      console.log('   No changes were made.\n');
      process.exit(0);
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    console.log(`\n✅ ${role.toUpperCase()} account created successfully!`);
    console.log(`   Email:  ${user.email}`);
    console.log(`   Name:   ${user.firstName} ${user.lastName}`);
    console.log(`   Role:   ${user.role}`);
    console.log(`   ID:     ${user._id}\n`);
  } catch (error) {
    console.error('❌ Failed to create account:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }

  process.exit(0);
}

main();

// Cleanup script: deletes test users created by E2E runs
// Safe-guards:
// - Requires env ALLOW_E2E_CLEANUP=1 or --force flag
// - Only targets emails matching controlled patterns for test accounts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function wants(arg) {
  return process.argv.includes(arg);
}

const DRY_RUN = wants("--dry-run");
const FORCE = wants("--force") || process.env.ALLOW_E2E_CLEANUP === "1";

function testEmailFilter() {
  return {
    OR: [
      { email: "e2e@example.com" },
      { AND: [{ email: { startsWith: "e2e-" } }, { email: { endsWith: "@example.com" } }] },
      { AND: [{ email: { startsWith: "invitee-" } }, { email: { endsWith: "@example.com" } }] },
      // Back-compat: any explicit Playwright tag we may adopt in future
      { AND: [{ email: { contains: "+e2e@" } }] },
    ],
  };
}

async function main() {
  if (!FORCE) {
    console.error("Refusing to run: set ALLOW_E2E_CLEANUP=1 or pass --force");
    process.exit(2);
  }

  const where = testEmailFilter();

  // Identify test users
  const users = await prisma.user.findMany({ where, select: { id: true, email: true } });
  const userIds = users.map((u) => u.id);
  console.log(`Found ${users.length} test user(s).`);
  if (users.length) {
    console.log(users.map((u) => ` - ${u.email}`).join("\n"));
  }

  // Clean invites that reference these emails (optional but tidy)
  const inviteWhere = {
    OR: [
      { email: "e2e@example.com" },
      { AND: [{ email: { startsWith: "e2e-" } }, { email: { endsWith: "@example.com" } }] },
      { AND: [{ email: { startsWith: "invitee-" } }, { email: { endsWith: "@example.com" } }] },
    ],
  };

  if (DRY_RUN) {
    const inviteCount = await prisma.orgInvite.count({ where: inviteWhere });
    console.log(`[dry-run] Would delete ${users.length} user(s) and ${inviteCount} invite(s).`);
    return;
  }

  // Execute deletions. DB-level cascades will clean related rows (sessions, accounts, diary, memberships)
  const inviteResult = await prisma.orgInvite.deleteMany({ where: inviteWhere });
  const userResult = await prisma.user.deleteMany({ where });

  console.log(`Deleted ${userResult.count} user(s) and ${inviteResult.count} invite(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


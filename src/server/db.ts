import { PrismaClient } from "@prisma/client";

import { env } from "~/env";

const createPrismaClient = () => {
  // Configure Prisma for serverless environments
  const prismaOptions: any = {
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  };

  // Add connection pool configuration for production/Vercel
  if (env.NODE_ENV === "production") {
    // Ensure we're using connection pooling (pgbouncer or similar)
    // The DATABASE_URL should include ?pgbouncer=true&connect_timeout=15
    prismaOptions.datasources = {
      db: {
        url: env.DATABASE_URL,
      },
    };
    
    // Limit connection pool size for serverless
    prismaOptions.connectionLimit = 1;
  }

  const client = new PrismaClient(prismaOptions);

  // Ensure proper cleanup in serverless environments
  if (env.NODE_ENV === "production") {
    // Disconnect on function termination
    process.on("beforeExit", async () => {
      await client.$disconnect();
    });
  }

  return client;
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

// In production, always create new client to avoid connection issues
// In development, reuse the client for hot reloading
if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

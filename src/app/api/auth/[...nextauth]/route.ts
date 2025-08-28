import NextAuth from "next-auth";
import { authOptions } from "~/server/auth/config";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Ensure Node.js runtime for Prisma adapter
export const runtime = "nodejs";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type DefaultSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
// Determine if we're in production based on NEXTAUTH_URL
const isProduction = env.NEXTAUTH_URL?.startsWith("https://") ?? false;

export const authOptions: NextAuthOptions = {
  session: { 
    strategy: "database",
    // Ensure session max age is reasonable for database sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  // Explicit cookie configuration for Vercel deployment
  cookies: {
    sessionToken: {
      name: `${isProduction ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        // Ensure domain matches NEXTAUTH_URL
        domain: isProduction ? ".vercel.app" : undefined,
      },
    },
    callbackUrl: {
      name: `${isProduction ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    csrfToken: {
      name: `${isProduction ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },
  // Use secure cookies in production
  useSecureCookies: isProduction,
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      // Explicitly request profile and email
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: async ({ session, user }) => {
      // Log session creation for debugging
      if (env.NODE_ENV !== "production") {
        console.log("[AUTH] Session callback:", { 
          userId: user?.id, 
          email: user?.email,
          sessionUser: session?.user?.email 
        });
      }
      
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
    signIn: async ({ user, account, profile }) => {
      // Log sign-in attempts for debugging
      if (env.NODE_ENV !== "production") {
        console.log("[AUTH] Sign-in attempt:", { 
          userId: user?.id, 
          email: user?.email,
          provider: account?.provider,
          accountId: account?.providerAccountId
        });
      }
      
      // Verify we have required data
      if (!user?.email) {
        console.error("[AUTH] Sign-in failed: No email provided");
        return false;
      }
      
      return true;
    },
    redirect: async ({ url, baseUrl }) => {
      // Ensure redirects stay within the app
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin", // Redirect errors to signin page
  },
  events: {
    signIn: async ({ user, account, profile, isNewUser }) => {
      console.log("[AUTH] Sign-in event:", {
        userId: user?.id,
        email: user?.email,
        isNewUser,
        provider: account?.provider,
      });
      
      try {
        const org = await db.organization.findFirst({ select: { id: true } });
        if (!org) {
          console.log("[AUTH] No organization exists yet");
          return;
        }
        if (!user?.id) {
          console.error("[AUTH] No user ID in sign-in event");
          return;
        }
        
        const membership = await db.orgMembership.upsert({
          where: { orgId_userId: { orgId: org.id, userId: user.id } },
          update: {},
          create: { orgId: org.id, userId: user.id, role: "USER" },
        });
        
        console.log("[AUTH] Org membership ensured:", {
          userId: user.id,
          orgId: org.id,
          membershipId: membership.id,
          role: membership.role,
        });
      } catch (error) {
        // Log but don't fail sign-in for org membership errors
        console.error("[AUTH] Error creating org membership:", error);
      }
    },
    createUser: async ({ user }) => {
      console.log("[AUTH] New user created:", {
        userId: user?.id,
        email: user?.email,
      });
    },
    linkAccount: async ({ user, account, profile }) => {
      console.log("[AUTH] Account linked:", {
        userId: user?.id,
        provider: account?.provider,
        accountId: account?.providerAccountId,
      });
    },
    session: async ({ session, token }) => {
      if (env.NODE_ENV !== "production") {
        console.log("[AUTH] Session event:", {
          hasSession: !!session,
          userId: session?.user?.id,
          expires: session?.expires,
        });
      }
    },
  },
  secret: env.AUTH_SECRET,
  debug: env.NODE_ENV !== "production", // Only debug in development
  logger: {
    error: (code, metadata) => {
      console.error("[AUTH ERROR]", code, metadata);
    },
    warn: (code) => {
      console.warn("[AUTH WARN]", code);
    },
    debug: (code, metadata) => {
      if (env.NODE_ENV !== "production") {
        console.log("[AUTH DEBUG]", code, metadata);
      }
    },
  },
};

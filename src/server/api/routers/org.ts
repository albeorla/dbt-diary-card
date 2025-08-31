import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import { sendInviteEmail } from "~/server/email/mailer";

export const orgRouter = createTRPCRouter({
  state: protectedProcedure.query(async ({ ctx }) => {
    const org = ctx.orgId ? await ctx.db.organization.findUnique({ where: { id: ctx.orgId } }) : null;
    let membershipId: string | null = null;
    if (ctx.orgId && ctx.session?.user?.id) {
      const m = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: ctx.session.user.id }, select: { id: true } });
      membershipId = m?.id ?? null;
    }
    return { org, role: ctx.role, membershipId };
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(2) }))
    .mutation(async ({ ctx, input }) => {
      // Only allow if no org exists yet
      const existing = await ctx.db.organization.findFirst();
      if (existing) throw new Error("Organization already exists");
      const org = await ctx.db.organization.create({ data: { name: input.name } });
      if (ctx.session?.user?.id) {
        await ctx.db.orgMembership.create({ data: { orgId: org.id, userId: ctx.session.user.id, role: "ADMIN" } });
      }
      return org;
    }),

  listMembers: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.orgId) return [];
    const members = await ctx.db.orgMembership.findMany({
      where: { orgId: ctx.orgId },
      include: { user: true, manager: { include: { user: true } } },
    });
    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user?.name ?? m.user?.email ?? m.userId,
      role: m.role,
      managerId: m.managerId,
      managerName: m.manager?.user?.name ?? null,
    }));
  }),

  setRole: protectedProcedure
    .input(z.object({ membershipId: z.string(), role: z.enum(["ADMIN", "MANAGER", "USER"]) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.orgMembership.update({ where: { id: input.membershipId }, data: { role: input.role } });
    }),

  assignManager: protectedProcedure
    .input(z.object({ membershipId: z.string(), managerMembershipId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.orgMembership.update({ where: { id: input.membershipId }, data: { managerId: input.managerMembershipId ?? undefined } });
    }),

  managerUsers: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.orgId || !ctx.session?.user?.id) return [];
    const me = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: ctx.session.user.id }, select: { id: true } });
    if (!me?.id) return [];
    const users = await ctx.db.orgMembership.findMany({
      where: { orgId: ctx.orgId, managerId: me.id, role: "USER" },
      include: { user: true },
    });
    return users.map((m) => ({ membershipId: m.id, userId: m.userId, name: m.user?.name ?? m.user?.email ?? m.userId }));
  }),

  managerSummary: protectedProcedure
    .input(z.object({ start: z.string(), end: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId || !ctx.session?.user?.id) return [];
      const me = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: ctx.session.user.id }, select: { id: true } });
      if (!me?.id) return [];
      const users = await ctx.db.orgMembership.findMany({ where: { orgId: ctx.orgId, managerId: me.id, role: "USER" }, select: { userId: true } });
      const userIds = users.map((u) => u.userId);
      if (userIds.length === 0) return [];
      const entries = await ctx.db.diaryEntry.findMany({
        where: { userId: { in: userIds }, entryDate: { gte: new Date(input.start), lte: new Date(input.end) } },
        select: { userId: true },
      });
      const counts = new Map<string, number>();
      for (const e of entries) counts.set(e.userId, (counts.get(e.userId) ?? 0) + 1);
      return userIds.map((uid) => ({ userId: uid, entryCount: counts.get(uid) ?? 0 }));
    }),

  assignByEmail: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["ADMIN", "MANAGER", "USER"]).default("USER"),
        managerMembershipId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.orgId) throw new Error("No organization in context");
      const email = input.email.toLowerCase();
      const user = await ctx.db.user.findUnique({ where: { email } });
      if (user) {
        const membership = await ctx.db.orgMembership.upsert({
          where: { orgId_userId: { orgId: ctx.orgId, userId: user.id } },
          update: { role: input.role, managerId: input.managerMembershipId ?? undefined },
          create: { orgId: ctx.orgId, userId: user.id, role: input.role, managerId: input.managerMembershipId ?? undefined },
        });
        return { status: "assigned" as const, membershipId: membership.id };
      }
      // create invite
      const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const invite = await ctx.db.orgInvite.create({
        data: {
          orgId: ctx.orgId,
          email,
          role: input.role,
          managerId: input.managerMembershipId ?? undefined,
          token,
          expiresAt,
        },
      });
      // Send invite email
      const base = env.NEXTAUTH_URL ?? "http://localhost:3000";
      // Magic link: auto-accept + auto-login
      const link = `${base}/api/invite/accept/${invite.token}`;
      try {
        await sendInviteEmail(email, link);
      } catch (e) {
        // Log but still return invite
        console.error("Failed to send invite email", e);
      }
      return { status: "invited" as const, token: invite.token, expiresAt: invite.expiresAt };
    }),

  consumeInvite: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      const inv = await ctx.db.orgInvite.findUnique({ where: { token: input.token } });
      if (!inv) throw new TRPCError({ code: "NOT_FOUND" });
      if (inv.consumedAt) throw new TRPCError({ code: "CONFLICT", message: "Invite already used" });
      if (new Date(inv.expiresAt).getTime() < Date.now()) throw new TRPCError({ code: "BAD_REQUEST", message: "Invite expired" });
      const user = await ctx.db.user.findUnique({ where: { id: ctx.session.user.id } });
      if (!user?.email || user.email.toLowerCase() !== inv.email.toLowerCase()) throw new TRPCError({ code: "FORBIDDEN", message: "Email mismatch" });
      await ctx.db.$transaction([
        ctx.db.orgMembership.upsert({
          where: { orgId_userId: { orgId: inv.orgId, userId: ctx.session.user.id } },
          update: { role: inv.role, managerId: inv.managerId ?? undefined },
          create: { orgId: inv.orgId, userId: ctx.session.user.id, role: inv.role, managerId: inv.managerId ?? undefined },
        }),
        ctx.db.orgInvite.update({ where: { id: inv.id }, data: { consumedAt: new Date(), consumedBy: ctx.session.user.id } }),
      ]);
      return { ok: true };
    }),

  adminManagerSummary: protectedProcedure
    .input(z.object({ start: z.string(), end: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) return [];
      const managers = await ctx.db.orgMembership.findMany({
        where: { orgId: ctx.orgId, role: "MANAGER" },
        include: { user: true },
      });
      const result: { managerId: string; managerName: string; usersCount: number; entriesCount: number }[] = [];
      for (const m of managers) {
        const users = await ctx.db.orgMembership.findMany({ where: { orgId: ctx.orgId, managerId: m.id, role: "USER" }, select: { userId: true } });
        const userIds = users.map((u) => u.userId);
        let entriesCount = 0;
        if (userIds.length) {
          entriesCount = await ctx.db.diaryEntry.count({ where: { userId: { in: userIds }, entryDate: { gte: new Date(input.start), lte: new Date(input.end) } } });
        }
        result.push({ managerId: m.id, managerName: m.user?.name ?? m.user?.email ?? m.id, usersCount: userIds.length, entriesCount });
      }
      return result;
    }),

  adminUserSummary: protectedProcedure
    .input(z.object({ start: z.string(), end: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) return [];
      const users = await ctx.db.orgMembership.findMany({ where: { orgId: ctx.orgId, role: "USER" }, include: { user: true } });
      const result: { userId: string; name: string; entryCount: number }[] = [];
      for (const u of users) {
        const entryCount = await ctx.db.diaryEntry.count({ where: { userId: u.userId, entryDate: { gte: new Date(input.start), lte: new Date(input.end) } } });
        result.push({ userId: u.userId, name: u.user?.name ?? u.user?.email ?? u.userId, entryCount });
      }
      return result;
    }),

  adminManagerUsers: protectedProcedure
    .input(z.object({ managerMembershipId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) return [];
      const users = await ctx.db.orgMembership.findMany({
        where: { orgId: ctx.orgId, managerId: input.managerMembershipId, role: "USER" },
        include: { user: true },
      });
      return users.map((m) => ({ membershipId: m.id, userId: m.userId, name: m.user?.name ?? m.user?.email ?? m.userId }));
    }),

  adminManagerSummaryFor: protectedProcedure
    .input(z.object({ managerMembershipId: z.string(), start: z.string(), end: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) return [];
      const users = await ctx.db.orgMembership.findMany({ where: { orgId: ctx.orgId, managerId: input.managerMembershipId, role: "USER" }, select: { userId: true } });
      const userIds = users.map((u) => u.userId);
      if (!userIds.length) return [];
      const entries = await ctx.db.diaryEntry.findMany({
        where: { userId: { in: userIds }, entryDate: { gte: new Date(input.start), lte: new Date(input.end) } },
        select: { userId: true },
      });
      const counts = new Map<string, number>();
      for (const e of entries) counts.set(e.userId, (counts.get(e.userId) ?? 0) + 1);
      return userIds.map((uid) => ({ userId: uid, entryCount: counts.get(uid) ?? 0 }));
    }),

  userEntriesAndLast: protectedProcedure
    .input(z.object({ userId: z.string(), start: z.string(), end: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) throw new TRPCError({ code: "FORBIDDEN" });
      // authorization: admin or manager of user
      const target = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: input.userId }, select: { managerId: true } });
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });
      if (ctx.role === "MANAGER") {
        const me = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: ctx.session!.user!.id }, select: { id: true } });
        if (!me?.id || target.managerId !== me.id) throw new TRPCError({ code: "FORBIDDEN" });
      } else if (ctx.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const [count, last] = await Promise.all([
        ctx.db.diaryEntry.count({ where: { userId: input.userId, entryDate: { gte: new Date(input.start), lte: new Date(input.end) } } }),
        ctx.db.diaryEntry.findFirst({ where: { userId: input.userId }, orderBy: { entryDate: "desc" }, select: { entryDate: true } }),
      ]);
      return { count, lastDate: last?.entryDate ?? null };
    }),

  userRecentEntries: protectedProcedure
    .input(z.object({ userId: z.string(), limit: z.number().min(1).max(50).default(5) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) throw new TRPCError({ code: "FORBIDDEN" });
      const target = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: input.userId }, select: { managerId: true } });
      if (!target) throw new TRPCError({ code: "NOT_FOUND" });
      if (ctx.role === "MANAGER") {
        const me = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: ctx.session!.user!.id }, select: { id: true } });
        if (!me?.id || target.managerId !== me.id) throw new TRPCError({ code: "FORBIDDEN" });
      } else if (ctx.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.diaryEntry.findMany({
        where: { userId: input.userId },
        orderBy: { entryDate: "desc" },
        take: input.limit,
        select: { id: true, entryDate: true, notes: true },
      });
    }),

  userEntryById: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) throw new TRPCError({ code: "FORBIDDEN" });
      const entry = await ctx.db.diaryEntry.findUnique({
        where: { id: input.entryId },
        include: {
          emotionRatings: true,
          urgesBehaviors: true,
          skillsUsed: { include: { skill: true } },
        },
      });
      if (!entry) throw new TRPCError({ code: "NOT_FOUND" });
      const target = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: entry.userId }, select: { managerId: true } });
      if (!target) throw new TRPCError({ code: "FORBIDDEN" });
      if (ctx.role === "MANAGER") {
        const me = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: ctx.session!.user!.id }, select: { id: true } });
        if (!me?.id || target.managerId !== me.id) throw new TRPCError({ code: "FORBIDDEN" });
      } else if (ctx.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return entry;
    }),

  adminTrendsEmotions: protectedProcedure
    .input(z.object({ start: z.string(), end: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) return [];
      const users = await ctx.db.orgMembership.findMany({ where: { orgId: ctx.orgId, role: "USER" }, select: { userId: true } });
      const userIds = users.map((u) => u.userId);
      if (!userIds.length) return [];
      const ratings = await ctx.db.emotionRating.findMany({
        where: { entry: { userId: { in: userIds }, entryDate: { gte: new Date(input.start), lte: new Date(input.end) } } },
        select: { emotion: true, rating: true },
      });
      const sums = new Map<string, { sum: number; n: number }>();
      for (const r of ratings) {
        const k = r.emotion as unknown as string;
        const cur = sums.get(k) ?? { sum: 0, n: 0 };
        cur.sum += r.rating; cur.n += 1; sums.set(k, cur);
      }
      return Array.from(sums, ([emotion, v]) => ({ emotion, avg: v.n ? v.sum / v.n : 0 })).sort((a, b) => b.avg - a.avg);
    }),

  adminTrendsSkills: protectedProcedure
    .input(z.object({ start: z.string(), end: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) return [];
      const users = await ctx.db.orgMembership.findMany({ where: { orgId: ctx.orgId, role: "USER" }, select: { userId: true } });
      const userIds = users.map((u) => u.userId);
      if (!userIds.length) return [];
      const used = await ctx.db.skillUsed.findMany({
        where: { entry: { userId: { in: userIds }, entryDate: { gte: new Date(input.start), lte: new Date(input.end) } } },
        include: { skill: true },
      });
      const counts = new Map<string, number>();
      for (const u of used) counts.set(u.skill.name, (counts.get(u.skill.name) ?? 0) + 1);
      return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    }),

  managerTrendsEmotions: protectedProcedure
    .input(z.object({ start: z.string(), end: z.string(), managerMembershipId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) return [];
      let managerId: string | null = input.managerMembershipId ?? null;
      if (!managerId) {
        const me = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: ctx.session!.user!.id }, select: { id: true } });
        managerId = me?.id ?? null;
      }
      if (!managerId) return [];
      const users = await ctx.db.orgMembership.findMany({ where: { orgId: ctx.orgId, managerId, role: "USER" }, select: { userId: true } });
      const userIds = users.map((u) => u.userId);
      if (!userIds.length) return [];
      const ratings = await ctx.db.emotionRating.findMany({
        where: { entry: { userId: { in: userIds }, entryDate: { gte: new Date(input.start), lte: new Date(input.end) } } },
        select: { emotion: true, rating: true },
      });
      const sums = new Map<string, { sum: number; n: number }>();
      for (const r of ratings) {
        const k = r.emotion as unknown as string;
        const cur = sums.get(k) ?? { sum: 0, n: 0 };
        cur.sum += r.rating; cur.n += 1; sums.set(k, cur);
      }
      return Array.from(sums, ([emotion, avg]) => ({ emotion, avg: avg.n ? avg.sum / avg.n : 0 })).sort((a, b) => b.avg - a.avg);
    }),

  managerTrendsSkills: protectedProcedure
    .input(z.object({ start: z.string(), end: z.string(), managerMembershipId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.orgId) return [];
      let managerId: string | null = input.managerMembershipId ?? null;
      if (!managerId) {
        const me = await ctx.db.orgMembership.findFirst({ where: { orgId: ctx.orgId, userId: ctx.session!.user!.id }, select: { id: true } });
        managerId = me?.id ?? null;
      }
      if (!managerId) return [];
      const users = await ctx.db.orgMembership.findMany({ where: { orgId: ctx.orgId, managerId, role: "USER" }, select: { userId: true } });
      const userIds = users.map((u) => u.userId);
      if (!userIds.length) return [];
      const used = await ctx.db.skillUsed.findMany({
        where: { entry: { userId: { in: userIds }, entryDate: { gte: new Date(input.start), lte: new Date(input.end) } } },
        include: { skill: true },
      });
      const counts = new Map<string, number>();
      for (const u of used) counts.set(u.skill.name, (counts.get(u.skill.name) ?? 0) + 1);
      return Array.from(counts, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    }),
});


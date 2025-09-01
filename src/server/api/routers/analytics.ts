import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const analyticsRouter = createTRPCRouter({
  getEmotionTrends: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        emotions: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate, emotions } = input;
      const ratings = await ctx.db.emotionRating.findMany({
        where: {
          entry: {
            userId: ctx.session.user.id,
            entryDate: { gte: new Date(startDate), lte: new Date(endDate) },
          },
          ...(emotions ? { emotion: { in: emotions as any } } : {}),
        },
        select: { emotion: true, rating: true, entry: { select: { entryDate: true } } },
      });
      return ratings.map((r) => ({
        emotion: r.emotion,
        rating: r.rating,
        date: r.entry.entryDate,
      }));
    }),

  getSkillsUsage: protectedProcedure
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ ctx, input }) => {
      const used = await ctx.db.skillUsed.findMany({
        where: {
          entry: {
            userId: ctx.session.user.id,
            entryDate: { gte: new Date(input.startDate), lte: new Date(input.endDate) },
          },
        },
        include: { skill: true },
      });
      const counts = new Map();
      for (const u of used) counts.set(u.skill.name, (counts.get(u.skill.name) ?? 0) + 1);
      return Array.from(counts, ([name, count]) => ({ name, count }));
    }),

  getUrgePatterns: protectedProcedure
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ ctx, input }) => {
      const urges = await ctx.db.urgeBehavior.findMany({
        where: {
          entry: {
            userId: ctx.session.user.id,
            entryDate: { gte: new Date(input.startDate), lte: new Date(input.endDate) },
          },
        },
        include: { entry: { select: { entryDate: true } } },
      });
      return urges;
    }),

  getWeeklySummary: protectedProcedure
    .input(z.object({ weekStart: z.string() }))
    .query(async ({ ctx, input }) => {
      const start = new Date(input.weekStart);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const entries = await ctx.db.diaryEntry.findMany({
        where: { userId: ctx.session.user.id, entryDate: { gte: start, lte: end } },
        include: { emotionRatings: true, urgesBehaviors: true, skillsUsed: true },
      });
      return entries;
    }),
});

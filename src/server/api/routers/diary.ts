import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const diaryRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        notes: z.string().optional(),
        emotions: z.array(
          z.object({ emotion: z.string(), rating: z.number().int().min(0).max(10) }),
        ),
        urges: z.array(
          z.object({
            urgeType: z.string(),
            intensity: z.number().int().min(0).max(5),
            actedOn: z.boolean(),
          }),
        ),
        skills: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { date, notes, emotions, urges, skills } = input;
      const parseYMD = (s: string) => {
        const [y, m, d] = s.split('-').map((v) => Number(v));
        return new Date((y as number) || 1970, ((m as number) || 1) - 1, (d as number) || 1);
      };
      const entryDate = parseYMD(date);

      const today = new Date();
      const isSameYMD = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      if (!isSameYMD(entryDate, today)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Past entries cannot be edited' });
      }

      const entry = await ctx.db.diaryEntry.upsert({
        where: { userId_entryDate: { userId: ctx.session.user.id, entryDate } },
        update: { notes, updatedAt: new Date() },
        create: {
          userId: ctx.session.user.id,
          entryDate,
          notes,
        },
      });

      // Replace related records
      await ctx.db.emotionRating.deleteMany({ where: { entryId: entry.id } });
      await ctx.db.urgeBehavior.deleteMany({ where: { entryId: entry.id } });
      await ctx.db.skillUsed.deleteMany({ where: { entryId: entry.id } });

      if (emotions.length) {
        await ctx.db.emotionRating.createMany({
          data: emotions.map((e) => ({
            entryId: entry.id,
            emotion: e.emotion as any,
            rating: e.rating,
          })),
        });
      }

      if (urges.length) {
        await ctx.db.urgeBehavior.createMany({
          data: urges.map((u) => ({
            entryId: entry.id,
            urgeType: u.urgeType as any,
            intensity: u.intensity,
            actedOn: u.actedOn,
          })),
        });
      }

      if (skills.length) {
        const skillRecords = await ctx.db.dBTSkill.findMany({
          where: { name: { in: skills } },
          select: { id: true },
        });
        await ctx.db.skillUsed.createMany({
          data: skillRecords.map((s) => ({ entryId: entry.id, skillId: s.id })),
        });
      }

      return entry;
    }),

  getByDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const entryDate = new Date(input.date);
      return ctx.db.diaryEntry.findFirst({
        where: { userId: ctx.session.user.id, entryDate },
        include: {
          emotionRatings: true,
          urgesBehaviors: true,
          skillsUsed: { include: { skill: true } },
        },
      });
    }),

  getRange: protectedProcedure
    .input(z.object({ startDate: z.string(), endDate: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.diaryEntry.findMany({
        where: {
          userId: ctx.session.user.id,
          entryDate: { gte: new Date(input.startDate), lte: new Date(input.endDate) },
        },
        orderBy: { entryDate: 'asc' },
      });
    }),

  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().default(7) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.diaryEntry.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { entryDate: 'desc' },
        take: input.limit,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.diaryEntry.delete({
        where: { id: input.id, userId: ctx.session.user.id } as any,
      });
    }),
});

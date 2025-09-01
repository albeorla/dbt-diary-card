import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const skillsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const skills = await ctx.db.dBTSkill.findMany();
    const grouped = skills.reduce<
      Record<string, { id: string; name: string; description: string | null }[]>
    >((acc, s) => {
      (acc[s.module] ??= []).push({ id: s.id, name: s.name, description: s.description });
      return acc;
    }, {});
    return grouped;
  }),

  getByModule: publicProcedure
    .input(z.object({ module: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.dBTSkill.findMany({ where: { module: input.module as any } });
    }),
});

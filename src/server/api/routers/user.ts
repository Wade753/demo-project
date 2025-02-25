import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { hashPassword } from "@/lib/utils";

export const userRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string(),
        password: z.string().min(4),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: await hashPassword(input.password),
        },
      });
    }),
});

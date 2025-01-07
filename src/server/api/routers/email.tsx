import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { mails } from "~/server/db/schema";

import { resend } from "~/server/emails";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import StripeWelcomeEmail from "~/server/emails/stripe-welcome";

export const emailRouter = createTRPCRouter({
  send: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const mail = await ctx.db
        .insert(mails)
        .values({
          status: "pending",
          template: "stripe-welcome",
          to: input.email,
        })
        .returning()
        .then((rows) => rows.at(0));
      if (!mail) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const r = await resend.emails.send({
        from: "MappaTest@thiagovaldiviezo.com",
        to: input.email,
        subject: "Mappa Test",
        react: <StripeWelcomeEmail />,
      });

      if (r.error) {
        await ctx.db
          .update(mails)
          .set({
            status: "failed",
          })
          .where(eq(mails.id, mail.id));
      } else {
        await ctx.db
          .update(mails)
          .set({
            status: "sent",
          })
          .where(eq(mails.id, mail.id));
      }
    }),
});

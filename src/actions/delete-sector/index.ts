"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { sectorsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { getSession } from "@/lib/session";

export const deleteSector = actionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const sector = await db.query.sectorsTable.findFirst({
      where: eq(sectorsTable.id, parsedInput.id),
    });
    if (!sector) {
      throw new Error("Setor não encontrado");
    }

    await db.delete(sectorsTable).where(eq(sectorsTable.id, parsedInput.id));
    revalidatePath("/setores");
  });

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { sectorsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { getSession } from "@/lib/session";

import { ErrorMessages, ErrorTypes, upsertSectorSchema } from "./schema";

export const upsertSector = actionClient
  .schema(upsertSectorSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSession();
    if (!session?.user) {
      return {
        error: {
          type: ErrorTypes.UNAUTHENTICATED,
          message: ErrorMessages[ErrorTypes.UNAUTHENTICATED],
        },
      };
    }

    if (parsedInput.id) {
      // Update existing sector
      await db
        .update(sectorsTable)
        .set({
          name: parsedInput.name,
        })
        .where(eq(sectorsTable.id, parsedInput.id));
    } else {
      // Create new sector
      await db.insert(sectorsTable).values({
        name: parsedInput.name,
      });
    }

    revalidatePath("/setores");
    revalidatePath("/setores-selecao");
  });

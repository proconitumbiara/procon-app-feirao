"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { operationsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { getSession } from "@/lib/session";

import { ErrorMessages, ErrorTypes } from "./schema";
import { schema } from "./schema";

export const finishOperation = actionClient
  .schema(schema)
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

    await db
      .update(operationsTable)
      .set({
        status: "finished",
        updatedAt: new Date(),
      })
      .where(eq(operationsTable.id, parsedInput.operationId));

    revalidatePath("/atendimento");
  });

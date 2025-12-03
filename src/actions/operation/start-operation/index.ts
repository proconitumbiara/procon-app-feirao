"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { operationsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { getSession } from "@/lib/session";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const startOperation = actionClient
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

    await db.insert(operationsTable).values({
      status: "operating",
      userId: session.user.id,
      service_point: parsedInput.servicePoint,
    });

    revalidatePath("/atendimento");

    return { success: true };
  });

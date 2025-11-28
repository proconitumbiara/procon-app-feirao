"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { getSession } from "@/lib/session";

import { ErrorMessages, ErrorTypes, schema } from "./schema";

export const updateUser = actionClient
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
      .update(usersTable)
      .set({
        name: parsedInput.name,
        phoneNumber: parsedInput.phoneNumber,
        cpf: parsedInput.cpf,
      })
      .where(eq(usersTable.id, session.user.id));

    revalidatePath("/configuracoes");
  });

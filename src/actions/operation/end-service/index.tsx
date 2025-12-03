"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { ticketsTable, treatmentsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import { EndServiceSchema } from "./schema";
import { ErrorMessages, ErrorTypes } from "./schema";

export const endService = actionClient
  .schema(EndServiceSchema)
  .action(async ({ parsedInput }) => {
    // Buscar atendimento
    const treatment = await db.query.treatmentsTable.findFirst({
      where: eq(treatmentsTable.id, parsedInput.treatmentId),
    });
    if (!treatment) {
      return {
        error: {
          type: ErrorTypes.TREATMENT_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.TREATMENT_NOT_FOUND],
        },
      };
    }
    // Verificar se o atendimento está em andamento
    if (treatment.status !== "in_service") {
      return {
        error: {
          type: ErrorTypes.TREATMENT_NOT_IN_SERVICE,
          message: ErrorMessages[ErrorTypes.TREATMENT_NOT_IN_SERVICE],
        },
      };
    }

    // Atualizar status do ticket relacionado para "completed"
    if (treatment.ticketId) {
      await db
        .update(ticketsTable)
        .set({ status: "completed" })
        .where(eq(ticketsTable.id, treatment.ticketId));
    }

    // Atualizar status do atendimento para "completed"
    await db
      .update(treatmentsTable)
      .set({
        status: "completed",
      })
      .where(eq(treatmentsTable.id, treatment.id));

    revalidatePath("/atendimento");
  });

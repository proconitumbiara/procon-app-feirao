"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { getSession } from "@/lib/session";

import { CancelTicketSchema, ErrorMessages, ErrorTypes } from "./schema";

export const cancelTicket = actionClient
  .schema(CancelTicketSchema)
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

    // Buscar ticket atual
    const ticket = await db.query.ticketsTable.findFirst({
      where: eq(ticketsTable.id, parsedInput.id),
    });

    if (!ticket) {
      return {
        error: {
          type: ErrorTypes.TICKET_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.TICKET_NOT_FOUND],
        },
      };
    }

    // Verificar se já está cancelado
    if (ticket.status === "canceled") {
      return {
        error: {
          type: ErrorTypes.ALREADY_CANCELED,
          message: ErrorMessages[ErrorTypes.ALREADY_CANCELED],
        },
      };
    }

    // Atualizar status para canceled
    await db
      .update(ticketsTable)
      .set({ status: "canceled" })
      .where(eq(ticketsTable.id, parsedInput.id));

    revalidatePath("/atendimento");

    return { data: { success: true } };
  });

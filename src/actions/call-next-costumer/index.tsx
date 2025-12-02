"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { sectorsTable, ticketsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { sendToPanel } from "@/lib/panel-api";

import { CallNextSchema, ErrorMessages, ErrorTypes } from "./schema";

export const callNextTicket = actionClient
  .schema(CallNextSchema)
  .action(async ({ parsedInput }) => {
    const sector = await db.query.sectorsTable.findFirst({
      where: eq(sectorsTable.id, parsedInput.sectorId),
    });

    if (!sector) {
      return {
        error: {
          type: ErrorTypes.SECTOR_NOT_FOUND,
          message: ErrorMessages[ErrorTypes.SECTOR_NOT_FOUND],
        },
      };
    }

    const ticket = await db.query.ticketsTable.findFirst({
      where: and(
        eq(ticketsTable.status, "pending"),
        eq(ticketsTable.sectorId, parsedInput.sectorId),
      ),
      orderBy: (tickets) => asc(tickets.createdAT),
    });

    if (!ticket) {
      return {
        error: {
          type: ErrorTypes.NO_PENDING_TICKET,
          message: ErrorMessages[ErrorTypes.NO_PENDING_TICKET],
        },
      };
    }

    await db
      .update(ticketsTable)
      .set({
        status: "completed",
        calledAt: new Date(),
      })
      .where(eq(ticketsTable.id, ticket.id));

    revalidatePath(`/setores-atendimento/${parsedInput.sectorId}`);

    await sendToPanel({
      name: ticket.costumer_name,
      sector: sector.name,
    });

    return { success: true };
  });

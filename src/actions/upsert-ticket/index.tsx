"use server";

import "@/ws-server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { getSession } from "@/lib/session";
// Importar ws-server para garantir inicialização do servidor WebSocket
import { broadcastTicketUpdate } from "@/ws-server";

import {
  CreateTicketSchema,
  ErrorMessages,
  ErrorTypes,
  UpdateTicketSchema,
} from "./schema";

export const updateTicket = actionClient
  .schema(UpdateTicketSchema)
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
          type: ErrorTypes.UNAUTHENTICATED,
          message: "Ticket não encontrado",
        },
      };
    }

    // Preparar dados para atualização
    const updateData: {
      costumer_name?: string;
      sectorId?: string;
    } = {};

    if (parsedInput.costumer_name !== undefined) {
      updateData.costumer_name = parsedInput.costumer_name;
    }
    if (parsedInput.sectorId !== undefined) {
      updateData.sectorId = parsedInput.sectorId;
    }

    await db
      .update(ticketsTable)
      .set(updateData)
      .where(eq(ticketsTable.id, parsedInput.id));

    revalidatePath("/atendimento");

    // Emitir evento WebSocket para atualização em tempo real
    broadcastTicketUpdate({
      type: "ticket-updated",
      ticketId: parsedInput.id,
    });

    return { data: { success: true } };
  });

export const createTicket = actionClient
  .schema(CreateTicketSchema)
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

    const [newTicket] = await db
      .insert(ticketsTable)
      .values({
        costumer_name: parsedInput.costumer_name,
        status: "pending",
        sectorId: parsedInput.sectorId,
      })
      .returning();

    revalidatePath("/atendimento");

    // Emitir evento WebSocket para atualização em tempo real
    broadcastTicketUpdate({
      type: "ticket-created",
      ticketId: newTicket.id,
    });

    return { data: newTicket };
  });

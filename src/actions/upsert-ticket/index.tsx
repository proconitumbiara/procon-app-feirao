"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { getSession } from "@/lib/session";
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
      sectorId?: string | null;
      service_type?: string;
    } = {};

    if (parsedInput.costumer_name !== undefined) {
      updateData.costumer_name = parsedInput.costumer_name;
    }
    if (parsedInput.sectorId !== undefined) {
      // Converter string vazia para null, caso contrário usar o valor
      updateData.sectorId =
        parsedInput.sectorId && parsedInput.sectorId.length > 0
          ? parsedInput.sectorId
          : null;
    }
    if (parsedInput.service_type !== undefined) {
      updateData.service_type = parsedInput.service_type;
    }

    await db
      .update(ticketsTable)
      .set(updateData)
      .where(eq(ticketsTable.id, parsedInput.id));

    revalidatePath("/atendimento");

    // Emitir evento de atualização via WebSocket (não bloqueia a operação em caso de erro)
    try {
      broadcastTicketUpdate({
        type: "ticket-updated",
        ticketId: parsedInput.id,
      });
    } catch (error) {
      // Erro no WebSocket não deve impedir a atualização do ticket
      console.error(
        "[Ticket Update] Erro ao emitir evento WebSocket (ignorado):",
        error,
      );
    }

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
        sectorId:
          parsedInput.sectorId && parsedInput.sectorId.length > 0
            ? parsedInput.sectorId
            : null, // Converter string vazia ou undefined para null
        service_type: parsedInput.service_type,
      })
      .returning();

    revalidatePath("/atendimento");

    // Emitir evento de criação via WebSocket (não bloqueia a operação em caso de erro)
    try {
      broadcastTicketUpdate({
        type: "ticket-created",
        ticketId: newTicket.id,
      });
    } catch (error) {
      // Erro no WebSocket não deve impedir a criação do ticket
      console.error(
        "[Ticket Create] Erro ao emitir evento WebSocket (ignorado):",
        error,
      );
    }

    return { data: { success: true } };
  });

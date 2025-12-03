"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  operationsTable,
  sectorsTable,
  ticketsTable,
  treatmentsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { sendToPanel } from "@/lib/panel-api";
import { getSession } from "@/lib/session";

import { CallNextSchema, ErrorMessages, ErrorTypes } from "./schema";

export const callNextCostumer = actionClient
  .schema(CallNextSchema)
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

    // Buscar operação ativa do usuário logado
    const operation = await db.query.operationsTable.findFirst({
      where: and(
        eq(operationsTable.userId, session.user.id),
        eq(operationsTable.status, "operating"),
      ),
    });

    if (!operation) {
      return {
        error: {
          type: ErrorTypes.NO_OPERATION_ACTIVE,
          message: ErrorMessages[ErrorTypes.NO_OPERATION_ACTIVE],
        },
      };
    }

    // Para tickets de Renegociação, buscar o primeiro ticket pendente
    // Se sectorId for fornecido, filtrar por ele; caso contrário, buscar qualquer ticket de Renegociação
    const whereConditions = [
      eq(ticketsTable.status, "pending"),
      eq(ticketsTable.service_type, "Renegociação"),
    ];

    if (parsedInput.sectorId) {
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

      whereConditions.push(eq(ticketsTable.sectorId, parsedInput.sectorId));
    }

    const ticket = await db.query.ticketsTable.findFirst({
      where: and(...whereConditions),
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

    // Criar registro em treatmentsTable vinculando ticket e operation
    await db.insert(treatmentsTable).values({
      ticketId: ticket.id,
      operationId: operation.id,
      status: "in_service",
    });

    // Atualizar status do ticket para "in_service"
    await db
      .update(ticketsTable)
      .set({
        status: "in_service",
        calledAt: new Date(),
      })
      .where(eq(ticketsTable.id, ticket.id));

    revalidatePath("/atendimento");

    // Buscar setor se ticket tiver sectorId, caso contrário usar "Renegociação"
    let sectorName = "Renegociação";
    if (ticket.sectorId) {
      const ticketSector = await db.query.sectorsTable.findFirst({
        where: eq(sectorsTable.id, ticket.sectorId),
      });
      sectorName = ticketSector?.name || "Renegociação";
    }

    // Enviar para painel com service_point
    await sendToPanel({
      name: ticket.costumer_name,
      sector: sectorName,
      service_point: operation.service_point || "",
    });

    return { success: true };
  });

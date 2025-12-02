"use server";

import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { sectorsTable, ticketsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

const GetTicketsBySectorSchema = z.object({
  sectorId: z.string().uuid(),
});

export const getTicketsBySector = actionClient
  .schema(GetTicketsBySectorSchema)
  .action(async ({ parsedInput }) => {
    const sector = await db.query.sectorsTable.findFirst({
      where: eq(sectorsTable.id, parsedInput.sectorId),
    });

    if (!sector) {
      return {
        error: {
          message: "Setor não encontrado.",
        },
      };
    }

    const tickets = await db.query.ticketsTable.findMany({
      where: eq(ticketsTable.sectorId, parsedInput.sectorId),
      orderBy: (tickets) => asc(tickets.createdAT),
    });

    return {
      tickets,
    };
  });

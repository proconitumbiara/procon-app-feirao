import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Buscar parâmetros da query string (opcionais)
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const serviceType = searchParams.get("service_type");

  // Construir condições de filtro
  const conditions = [];
  if (status) {
    conditions.push(eq(ticketsTable.status, status));
  }
  if (serviceType) {
    conditions.push(eq(ticketsTable.service_type, serviceType));
  }

  // Aplicar filtros se houver condições
  const tickets = conditions.length > 0
    ? await db.query.ticketsTable.findMany({
        where: conditions.length === 1 ? conditions[0] : and(...conditions),
      })
    : await db.query.ticketsTable.findMany();

  return NextResponse.json({ tickets });
}

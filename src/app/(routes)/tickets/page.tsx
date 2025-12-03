import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { ticketsTable } from "@/db/schema";
import { getSession } from "@/lib/session";

import AddTicketButton from "./_components/add-ticket-button";
import TicketFilters from "./_components/ticket-filters";

export default async function AtendimentoPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  // Buscar tickets ordenados por createdAt (mais recentes primeiro)
  const tickets = await db.query.ticketsTable.findMany({
    orderBy: [desc(ticketsTable.createdAT)],
  });

  // Buscar setores
  const sectors = await db.query.sectorsTable.findMany({
    orderBy: (sectors) => [sectors.name],
  });

  return (
    <PageContainer className="flex flex-1 flex-col">
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Atendimento</PageTitle>
          <PageDescription>
            Visualize e gerencie os tickets de atendimento.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddTicketButton sectors={sectors} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <TicketFilters tickets={tickets} sectors={sectors} />
      </PageContent>
    </PageContainer>
  );
}

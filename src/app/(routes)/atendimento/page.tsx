import { and, asc, eq } from "drizzle-orm";
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

import OngoingOperationCard from "./_components/ongoing-operation-card";
import PendingTickets from "./_components/pending-tickets";
import ServiceInProgressCard from "./_components/service-in-progress-card";
import StartOperationButton from "./_components/start-operation-button";
import { TicketTableRow } from "./_components/tickets-table-columns";

const ProfessionalServices = async () => {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  const sectors = await db.query.sectorsTable.findMany();

  const operations = await db.query.operationsTable.findMany();
  const operatingOperation = operations.find(
    (op) => op.status === "operating" && op.userId === session.user.id,
  );

  // Buscar tickets de Renegociação pendentes
  const pendingTickets = await db.query.ticketsTable.findMany({
    where: and(
      eq(ticketsTable.status, "pending"),
      eq(ticketsTable.service_type, "Renegociação"),
    ),
    orderBy: (tickets) => asc(tickets.createdAT),
  });

  // Criar map de setores
  const sectorsMap = Object.fromEntries(sectors.map((s) => [s.id, s.name]));

  // Processar tickets para o formato esperado
  const tableData: TicketTableRow[] = pendingTickets.map((ticket) => ({
    id: ticket.id,
    status: ticket.status,
    priority: 0, // Prioridade padrão, pode ser ajustado se necessário
    clientName: ticket.costumer_name,
    clientId: ticket.costumer_name, // Usando costumer_name como ID também
    sectorName: ticket.sectorId
      ? sectorsMap[ticket.sectorId] || "Renegociação"
      : "Renegociação",
    sectorId: ticket.sectorId || "",
    createdAt: new Date(ticket.createdAT),
  }));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Olá, {session.user.name}!</PageTitle>
          <PageDescription>Inicie uma operação de atendimento.</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <StartOperationButton
            sectors={sectors}
            disabled={!!operatingOperation}
          />
        </PageActions>
      </PageHeader>
      <PageContent>
        <div className="flex h-full w-full gap-2">
          <OngoingOperationCard operations={operations} />
          <ServiceInProgressCard />
        </div>
        <div className="flex h-full w-full items-center justify-center gap-2">
          <PendingTickets initialTickets={tableData} sectors={sectors} />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default ProfessionalServices;

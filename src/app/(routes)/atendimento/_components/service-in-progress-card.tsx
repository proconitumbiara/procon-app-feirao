import { and, eq } from "drizzle-orm";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { db } from "@/db";
import { operationsTable, ticketsTable, treatmentsTable } from "@/db/schema";
import { getSession } from "@/lib/session";

import FinishServiceButton from "./finish-service-button";

const ServiceInProgressCard = async () => {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }

  // Buscar operação em andamento do usuário logado
  const operation = await db.query.operationsTable.findFirst({
    where: and(
      eq(operationsTable.userId, session.user.id),
      eq(operationsTable.status, "operating"),
    ),
  });

  if (!operation) {
    return (
      <Card className="text-muted-foreground hidden h-full w-full text-center text-sm">
        Nenhuma operação em andamento.
      </Card>
    );
  }

  // Buscar atendimento (treatment) em andamento para a operação
  const treatment = await db.query.treatmentsTable.findFirst({
    where: and(
      eq(treatmentsTable.operationId, operation.id),
      eq(treatmentsTable.status, "in_service"),
    ),
  });

  if (!treatment) {
    return (
      <Card className="text-muted-foreground h-full w-full text-center text-sm">
        Nenhum atendimento em andamento.
      </Card>
    );
  }

  // Buscar ticket e cliente associados ao atendimento
  // Apenas tickets de Renegociação devem ser exibidos
  const ticket = await db.query.ticketsTable.findFirst({
    where: and(
      eq(ticketsTable.id, treatment.ticketId),
      eq(ticketsTable.service_type, "Renegociação"),
    ),
  });

  // Se o ticket não for de Renegociação, não exibir nada
  if (!ticket) {
    return (
      <Card className="text-muted-foreground h-full w-full text-center text-sm">
        Nenhum atendimento em andamento.
      </Card>
    );
  }

  // Formatar data e horário de início
  const startDate = treatment.createdAT ? new Date(treatment.createdAT) : null;
  const formattedDate = startDate ? startDate.toLocaleDateString() : "-";
  const formattedTime = startDate
    ? startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "-";

  return (
    <div className="flex h-full max-h-[80vh] w-full flex-col gap-4">
      <Card className="flex h-full w-full flex-col">
        <CardContent className="flex-1 overflow-auto p-0">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-primary font-semibold">
              Dados do atendimento em andamento
            </h1>
            <div className="flex flex-row gap-2">
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-semibold">Consumidor:</span>{" "}
                {ticket?.costumer_name || "-"}
              </p>
              <div className="h-4 border-l border-gray-300" />
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-semibold">Data:</span>{" "}
                {formattedDate}
              </p>
              <div className="h-4 border-l border-gray-300" />
              <p className="text-muted-foreground text-sm">
                <span className="text-primary font-semibold">
                  Horário de início:
                </span>{" "}
                {formattedTime}
              </p>
              <div className="h-4 border-l border-gray-300" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex w-full flex-row items-center justify-center gap-4">
          <FinishServiceButton treatmentId={treatment.id} />
        </CardFooter>
      </Card>
    </div>
  );
};

export default ServiceInProgressCard;

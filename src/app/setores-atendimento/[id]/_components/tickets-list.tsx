"use client";

import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";

import { getTicketsBySector } from "@/actions/tickets/get-by-sector";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ticketsTable } from "@/db/schema";
import { cn } from "@/lib/utils";

type Ticket = typeof ticketsTable.$inferSelect;

type TicketsListProps = {
  sectorId: string;
  refreshToken: number;
};

export default function TicketsList({
  sectorId,
  refreshToken,
}: TicketsListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const { execute, status } = useAction(getTicketsBySector, {
    onSuccess: (result) => {
      if (result.data?.error) {
        return;
      }

      setTickets(result.data?.tickets ?? []);
    },
  });

  useEffect(() => {
    execute({ sectorId });
  }, [execute, sectorId, refreshToken]);

  const { pendingTickets, completedTickets, canceledTickets } = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => {
      const isPendingA = a.status === "pending";
      const isPendingB = b.status === "pending";

      if (isPendingA !== isPendingB) {
        return isPendingA ? -1 : 1;
      }

      return new Date(a.createdAT).getTime() - new Date(b.createdAT).getTime();
    });

    return {
      pendingTickets: sorted.filter((ticket) => ticket.status === "pending"),
      completedTickets: sorted.filter(
        (ticket) => ticket.status === "completed",
      ),
      canceledTickets: sorted.filter((ticket) => ticket.status === "canceled"),
    };
  }, [tickets]);

  const renderStatus = (status: string) => {
    const baseClass = "text-xs font-medium capitalize";
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500 text-white">Pendente</Badge>;
      case "completed":
        return (
          <Badge
            variant="outline"
            className={cn(baseClass, "border-emerald-400 text-emerald-600")}
          >
            Concluído
          </Badge>
        );
      case "canceled":
        return (
          <Badge
            variant="outline"
            className={cn(baseClass, "border-rose-400 text-rose-600")}
          >
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className={cn(baseClass)}>
            {status}
          </Badge>
        );
    }
  };

  if (status === "executing" && tickets.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  const sections = [
    {
      title: "Pendentes",
      tickets: pendingTickets,
      emptyMessage: "Nenhum ticket pendente.",
    },
    {
      title: "Concluídos",
      tickets: completedTickets,
      emptyMessage: "Nenhum ticket concluído.",
    },
    {
      title: "Cancelados",
      tickets: canceledTickets,
      emptyMessage: "Nenhum ticket cancelado.",
    },
  ];

  const renderTickets = (list: Ticket[], emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <Card className="border-border text-muted-foreground rounded-2xl border border-dashed p-4 text-center text-sm">
          {emptyMessage}
        </Card>
      );
    }

    return list.map((ticket) => (
      <Card
        key={ticket.id}
        className="border-border flex flex-col gap-1 rounded-2xl border p-4"
      >
        <div className="flex items-center justify-between">
          <strong className="text-lg font-semibold">
            {ticket.costumer_name}
          </strong>
          {renderStatus(ticket.status)}
        </div>
        <p className="text-muted-foreground text-xs">
          Criado em{" "}
          {new Date(ticket.createdAT).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </p>
      </Card>
    ));
  };

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <header className="flex items-center justify-between">
            <h3 className="text-base font-semibold">{section.title}</h3>
            <Badge variant="outline" className="text-xs font-normal">
              {section.tickets.length}
            </Badge>
          </header>
          <div className="flex flex-col gap-3">
            {renderTickets(section.tickets, section.emptyMessage)}
          </div>
        </section>
      ))}
    </div>
  );
}

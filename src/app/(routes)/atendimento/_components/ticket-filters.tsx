"use client";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sectorsTable, ticketsTable } from "@/db/schema";

import { ticketsTableColumns } from "./table-columns";
import TicketsCards from "./tickets-cards";

type Ticket = typeof ticketsTable.$inferSelect;
type Sector = typeof sectorsTable.$inferSelect;

export default function TicketFilters({
  tickets,
  sectors,
}: {
  tickets: Ticket[];
  sectors: Sector[];
}) {
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter((ticket) => {
      const matchesName = ticket.costumer_name
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      return matchesName && matchesStatus;
    });

    // Ordenar por createdAT do mais novo para o mais antigo
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAT).getTime();
      const dateB = new Date(b.createdAT).getTime();
      return dateB - dateA; // mais novo primeiro
    });

    return filtered;
  }, [tickets, nameFilter, statusFilter]);

  const columns = useMemo(() => ticketsTableColumns(sectors), [sectors]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-2 lg:flex-row">
        <Input
          type="text"
          placeholder="Buscar por nome do consumidor"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="w-full lg:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="canceled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setNameFilter("");
            setStatusFilter("all");
          }}
          variant="link"
          className="w-fit"
        >
          Resetar filtros
        </Button>
      </div>
      {/* Contador de registros */}
      <div className="text-muted-foreground mb-2 text-sm">
        {filteredTickets.length} registro
        {filteredTickets.length === 1 ? "" : "s"} encontrado
        {filteredTickets.length === 1 ? "" : "s"}
      </div>
      {/* Cards para mobile */}
      <div className="lg:hidden">
        <TicketsCards tickets={filteredTickets} sectors={sectors} />
      </div>
      {/* Tabela para desktop */}
      <div className="hidden lg:block">
        <DataTable data={filteredTickets} columns={columns} />
      </div>
    </>
  );
}

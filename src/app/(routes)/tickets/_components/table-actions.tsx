"use client";

import { EditIcon, XIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { cancelTicket } from "@/actions/cancel-ticket";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { sectorsTable, ticketsTable } from "@/db/schema";

import UpsertTicketForm from "./upsert-ticket-form";

type Ticket = typeof ticketsTable.$inferSelect;
type Sector = typeof sectorsTable.$inferSelect;

interface TableTicketActionsProps {
  ticket: Ticket;
  sectors: Sector[];
}

const TableTicketActions = ({ ticket, sectors }: TableTicketActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogOpen] = useState(false);
  const [cancelDialogIsOpen, setCancelDialogIsOpen] = useState(false);

  const { execute: executeCancelTicket, status: cancelStatus } = useAction(
    cancelTicket,
    {
      onSuccess: () => {
        toast.success("Ticket cancelado com sucesso!");
        setCancelDialogIsOpen(false);
      },
      onError: (error) => {
        const message =
          error.error?.serverError ||
          error.error?.validationErrors?.id?._errors?.[0] ||
          "Erro ao cancelar ticket.";
        toast.error(message);
      },
    },
  );

  const isCanceled = ticket.status === "canceled";
  const isCanceling = cancelStatus === "executing";

  const handleCancelClick = () => {
    if (isCanceled) return;
    setCancelDialogIsOpen(true);
  };

  const handleConfirmCancel = () => {
    executeCancelTicket({ id: ticket.id });
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogOpen}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUpsertDialogOpen(true)}
          aria-label={`Editar ticket ${ticket.costumer_name}`}
          className="hover:text-primary cursor-pointer hover:bg-transparent"
        >
          <EditIcon className="h-4 w-4" />
          Editar
        </Button>
        <UpsertTicketForm
          ticket={ticket}
          sectors={sectors}
          onSuccess={() => setUpsertDialogOpen(false)}
        />
      </Dialog>
      <AlertDialog
        open={cancelDialogIsOpen}
        onOpenChange={setCancelDialogIsOpen}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancelClick}
          disabled={isCanceled || isCanceling}
          aria-label={`Cancelar ticket ${ticket.costumer_name}`}
          className="hover:text-destructive cursor-pointer hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XIcon className="h-4 w-4" />
          {isCanceled ? "Cancelado" : "Cancelar"}
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o ticket de{" "}
              <strong>{ticket.costumer_name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCanceling}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isCanceling ? "Cancelando..." : "Confirmar cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TableTicketActions;

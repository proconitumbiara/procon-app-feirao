"use client";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { sectorsTable } from "@/db/schema";

import UpsertTicketForm from "./upsert-ticket-form";

type Sector = typeof sectorsTable.$inferSelect;

interface AddTicketButtonProps {
  sectors: Sector[];
}

const AddTicketButton = ({ sectors }: AddTicketButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus />
          Criar Ticket
        </Button>
      </DialogTrigger>
      <UpsertTicketForm sectors={sectors} onSuccess={() => setIsOpen(false)} />
    </Dialog>
  );
};

export default AddTicketButton;

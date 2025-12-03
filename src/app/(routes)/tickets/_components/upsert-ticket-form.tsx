"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { createTicket, updateTicket } from "@/actions/upsert-ticket";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sectorsTable, ticketsTable } from "@/db/schema";
import { formatName } from "@/lib/utils";

const formSchema = z
  .object({
    costumer_name: z.string().trim().min(3, {
      message: "Nome do consumidor deve ter pelo menos 3 caracteres.",
    }),
    sectorId: z.string().optional(),
    service_type: z.enum(["Serviço", "Renegociação"], {
      required_error: "Selecione um tipo de serviço.",
    }),
  })
  .refine(
    (data) => {
      if (data.service_type === "Serviço") {
        return (
          data.sectorId &&
          data.sectorId.length > 0 &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            data.sectorId,
          )
        );
      }
      return true;
    },
    {
      message: "Setor é obrigatório para tipo Serviço.",
      path: ["sectorId"],
    },
  );

type Ticket = typeof ticketsTable.$inferSelect;
type Sector = typeof sectorsTable.$inferSelect;

interface UpsertTicketFormProps {
  ticket?: Ticket;
  sectors: Sector[];
  onSuccess?: () => void;
}

const UpsertTicketForm = ({
  ticket,
  sectors,
  onSuccess,
}: UpsertTicketFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      costumer_name: ticket?.costumer_name || "",
      sectorId: ticket?.sectorId || "",
      service_type:
        (ticket?.service_type as "Serviço" | "Renegociação") || undefined,
    },
  });

  const { execute: executeCreateTicket, status: createStatus } = useAction(
    createTicket,
    {
      onSuccess: () => {
        toast.success("Ticket criado com sucesso!");
        onSuccess?.();
        form.reset();
      },
      onError: (error) => {
        toast.error("Erro ao criar ticket.");
        console.log(error);
      },
    },
  );

  const { execute: executeUpdateTicket, status: updateStatus } = useAction(
    updateTicket,
    {
      onSuccess: () => {
        toast.success("Ticket atualizado com sucesso!");
        onSuccess?.();
        form.reset();
      },
      onError: (error) => {
        toast.error("Erro ao atualizar ticket.");
        console.log(error);
      },
    },
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Se for Renegociação, enviar undefined (não enviar sectorId)
    // Se for Serviço, enviar o sectorId selecionado
    const submitValues = {
      costumer_name: values.costumer_name,
      service_type: values.service_type,
      sectorId:
        values.service_type === "Renegociação"
          ? undefined
          : values.sectorId || undefined,
    };

    if (ticket) {
      executeUpdateTicket({
        id: ticket.id,
        ...submitValues,
      });
    } else {
      executeCreateTicket(submitValues);
    }
  };

  const isPending = ticket
    ? updateStatus === "executing"
    : createStatus === "executing";

  const serviceType = form.watch("service_type");

  return (
    <DialogContent>
      <DialogTitle>
        {ticket
          ? `Editar Ticket - ${ticket.costumer_name}`
          : "Criar Novo Ticket"}
      </DialogTitle>
      <DialogDescription>
        {ticket
          ? "Edite as informações deste ticket."
          : "Crie um novo ticket de atendimento."}
      </DialogDescription>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="costumer_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Consumidor</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o nome do consumidor"
                    {...field}
                    onBlur={(e) => {
                      const formattedValue = formatName(e.target.value);
                      field.onChange(formattedValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="service_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Serviço</FormLabel>
                <div className="flex gap-4">
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value === "Serviço"}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange("Serviço");
                          } else if (field.value === "Serviço") {
                            field.onChange(undefined);
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel
                      className="cursor-pointer font-normal"
                      onClick={() => {
                        if (field.value === "Serviço") {
                          field.onChange(undefined);
                          form.setValue("sectorId", "");
                        } else {
                          field.onChange("Serviço");
                        }
                      }}
                    >
                      Serviço
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value === "Renegociação"}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange("Renegociação");
                            form.setValue("sectorId", "");
                          } else if (field.value === "Renegociação") {
                            field.onChange(undefined);
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel
                      className="cursor-pointer font-normal"
                      onClick={() => {
                        if (field.value === "Renegociação") {
                          field.onChange(undefined);
                        } else {
                          field.onChange("Renegociação");
                          form.setValue("sectorId", "");
                        }
                      }}
                    >
                      Renegociação
                    </FormLabel>
                  </FormItem>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {serviceType === "Serviço" && (
            <FormField
              control={form.control}
              name="sectorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Salvando..."
                : ticket
                  ? "Atualizar Ticket"
                  : "Criar Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertTicketForm;

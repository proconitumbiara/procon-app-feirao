"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { createTicket, updateTicket } from "@/actions/upsert-ticket";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sectorsTable, ticketsTable } from "@/db/schema";
import { formatName } from "@/lib/utils";

const formSchema = z.object({
    costumer_name: z.string().trim().min(3, { message: "Nome do consumidor deve ter pelo menos 3 caracteres." }),
    sectorId: z.string().uuid({ message: "Selecione um setor válido." }).min(1, { message: "Setor é obrigatório." }),
});

type Ticket = typeof ticketsTable.$inferSelect;
type Sector = typeof sectorsTable.$inferSelect;

interface UpsertTicketFormProps {
    ticket?: Ticket;
    sectors: Sector[];
    onSuccess?: () => void;
}

const UpsertTicketForm = ({ ticket, sectors, onSuccess }: UpsertTicketFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        shouldUnregister: true,
        resolver: zodResolver(formSchema),
        defaultValues: {
            costumer_name: ticket?.costumer_name || "",
            sectorId: ticket?.sectorId || "",
        }
    });

    const { execute: executeCreateTicket, status: createStatus } = useAction(createTicket, {
        onSuccess: () => {
            toast.success("Ticket criado com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: (error) => {
            toast.error("Erro ao criar ticket.");
            console.log(error);
        },
    });

    const { execute: executeUpdateTicket, status: updateStatus } = useAction(updateTicket, {
        onSuccess: () => {
            toast.success("Ticket atualizado com sucesso!");
            onSuccess?.();
            form.reset();
        },
        onError: (error) => {
            toast.error("Erro ao atualizar ticket.");
            console.log(error);
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (ticket) {
            executeUpdateTicket({
                id: ticket.id,
                ...values,
            });
        } else {
            executeCreateTicket(values);
        }
    };

    const isPending = ticket ? updateStatus === "executing" : createStatus === "executing";

    return (
        <DialogContent>
            <DialogTitle>{ticket ? `Editar Ticket - ${ticket.costumer_name}` : "Criar Novo Ticket"}</DialogTitle>
            <DialogDescription>
                {ticket ? "Edite as informações deste ticket." : "Crie um novo ticket de atendimento."}
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
                        name="sectorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Setor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um setor" />
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
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending
                                ? "Salvando..."
                                : ticket ? "Atualizar Ticket"
                                    : "Criar Ticket"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

export default UpsertTicketForm;
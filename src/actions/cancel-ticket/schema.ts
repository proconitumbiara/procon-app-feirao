import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  TICKET_NOT_FOUND: "TICKET_NOT_FOUND",
  ALREADY_CANCELED: "ALREADY_CANCELED",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.TICKET_NOT_FOUND]: "Ticket não encontrado",
  [ErrorTypes.ALREADY_CANCELED]: "Ticket já está cancelado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const CancelTicketSchema = z.object({
  id: z.string().uuid("ID do ticket inválido"),
});

export type CancelTicketSchema = z.infer<typeof CancelTicketSchema>;


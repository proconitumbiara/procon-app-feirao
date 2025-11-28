import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const UpdateTicketSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  costumer_name: z
    .string()
    .trim()
    .min(3, "Nome do consumidor deve ter pelo menos 3 caracteres")
    .optional(),
  sectorId: z.string().uuid("ID do setor inválido").optional(),
});

export const CreateTicketSchema = z.object({
  costumer_name: z
    .string()
    .trim()
    .min(3, "Nome do consumidor deve ter pelo menos 3 caracteres"),
  sectorId: z
    .string()
    .uuid("ID do setor inválido")
    .min(1, "ID do setor é obrigatório"),
});

export type UpdateTicketSchema = z.infer<typeof UpdateTicketSchema>;
export type CreateTicketSchema = z.infer<typeof CreateTicketSchema>;

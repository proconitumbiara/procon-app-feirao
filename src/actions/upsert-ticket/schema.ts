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
  service_type: z.enum(["Serviço", "Renegociação"]).optional(),
});

export const CreateTicketSchema = z
  .object({
    costumer_name: z
      .string()
      .trim()
      .min(3, "Nome do consumidor deve ter pelo menos 3 caracteres"),
    sectorId: z.string().optional(),
    service_type: z.enum(["Serviço", "Renegociação"], {
      required_error: "Tipo de serviço é obrigatório",
    }),
  })
  .refine(
    (data) => {
      if (data.service_type === "Serviço") {
        // Para Serviço, sectorId deve ser um UUID válido e não vazio
        return (
          data.sectorId &&
          data.sectorId.length > 0 &&
          z.string().uuid().safeParse(data.sectorId).success
        );
      }
      // Para Renegociação, aceita string vazia, undefined ou null
      return true;
    },
    {
      message: "Setor é obrigatório para tipo Serviço",
      path: ["sectorId"],
    }
  );

export type UpdateTicketSchema = z.infer<typeof UpdateTicketSchema>;
export type CreateTicketSchema = z.infer<typeof CreateTicketSchema>;

import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  SECTOR_NOT_FOUND: "SECTOR_NOT_FOUND",
  NO_PENDING_TICKET: "NO_PENDING_TICKET",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.SECTOR_NOT_FOUND]: "Setor não encontrado",
  [ErrorTypes.NO_PENDING_TICKET]:
    "Nenhum ticket pendente encontrado para o setor",
} as const;

export const CallNextSchema = z.object({
  sectorId: z.string().uuid(),
});

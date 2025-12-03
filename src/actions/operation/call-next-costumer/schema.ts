import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  SECTOR_NOT_FOUND: "SECTOR_NOT_FOUND",
  NO_PENDING_TICKET: "NO_PENDING_TICKET",
  NO_OPERATION_ACTIVE: "NO_OPERATION_ACTIVE",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.SECTOR_NOT_FOUND]: "Setor não encontrado",
  [ErrorTypes.NO_PENDING_TICKET]:
    "Nenhum ticket pendente encontrado para o setor",
  [ErrorTypes.NO_OPERATION_ACTIVE]:
    "Nenhuma operação ativa encontrada. Inicie uma operação primeiro.",
} as const;

export const CallNextSchema = z.object({
  sectorId: z.string().uuid().optional(),
});

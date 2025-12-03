"use client";
import { SmilePlus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { callNextCostumer } from "@/actions/operation/call-next-costumer";
import { Button } from "@/components/ui/button";

interface CallNextTicketButtonProps {
  disabled?: boolean;
  sectorId?: string;
}

const CallNextTicketButton = ({
  disabled,
  sectorId,
}: CallNextTicketButtonProps) => {
  const [, setError] = useState<string | null>(null);
  const { execute, status } = useAction(callNextCostumer, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        setError(result.data.error.message);
        return;
      }
      toast.success("Atendimento iniciado com sucesso!");
      setError(null);
    },
    onError: (err) => {
      const msg =
        err.error?.serverError ||
        err.error?.validationErrors?.sectorId?._errors?.[0] ||
        "Erro ao iniciar atendimento";
      toast.error(msg);
      setError(msg);
    },
  });

  return (
    <div>
      <Button
        disabled={disabled || status === "executing"}
        variant="default"
        onClick={() => execute({ sectorId: sectorId || undefined })}
      >
        <SmilePlus />
        {status === "executing" ? "Chamando..." : "Chamar próximo atendimento"}
      </Button>
    </div>
  );
};

export default CallNextTicketButton;

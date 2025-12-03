"use client";
import { BadgeCheck, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { endService } from "@/actions/operation/end-service";
import { Button } from "@/components/ui/button";

interface FinishServiceButtonProps {
  treatmentId: string;
}

const FinishServiceButton = ({ treatmentId }: FinishServiceButtonProps) => {
  const [, setError] = useState<string | null>(null);
  const { execute, status } = useAction(endService, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        setError(result.data.error.message);
        return;
      }
      toast.success("Atendimento finalizado com sucesso!");
      setError(null);
    },
    onError: (err) => {
      const msg =
        err.error?.serverError ||
        err.error?.validationErrors?.treatmentId?._errors?.[0] ||
        "Erro ao finalizar atendimento";
      toast.error(msg);
      setError(msg);
    },
  });

  return (
    <Button
      variant="default"
      disabled={status === "executing"}
      onClick={() => execute({ treatmentId })}
    >
      {status === "executing" ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Finalizando...
        </>
      ) : (
        <>
          <BadgeCheck className="mr-2 h-4 w-4" />
          Finalizar atendimento
        </>
      )}
    </Button>
  );
};

export default FinishServiceButton;

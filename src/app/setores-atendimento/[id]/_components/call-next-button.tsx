"use client";

import { Loader2, Megaphone } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { callNextTicket } from "@/actions/call-next-costumer";
import { Button } from "@/components/ui/button";

type CallNextButtonProps = {
  sectorId: string;
  onCalled: () => void;
};

export default function CallNextButton({
  sectorId,
  onCalled,
}: CallNextButtonProps) {
  const { execute, status } = useAction(callNextTicket, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }

      toast.success("Próximo consumidor chamado!");
      onCalled();
    },
    onError: () => {
      toast.error("Não foi possível chamar o próximo consumidor.");
    },
  });

  return (
    <div className="rounded-2xl border border-dashed p-4">
      <Button
        onClick={() => execute({ sectorId })}
        disabled={status === "executing"}
        size="lg"
        className="w-full gap-2 text-base"
      >
        {status === "executing" ? (
          <>
            <Loader2 className="size-6 animate-spin" />
            Chamando...
          </>
        ) : (
          <>
            <Megaphone className="size-6" />
            Chamar próximo atendimento
          </>
        )}
      </Button>
    </div>
  );
}

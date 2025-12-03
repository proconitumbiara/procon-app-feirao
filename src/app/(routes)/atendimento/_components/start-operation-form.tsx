import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { startOperation } from "@/actions/operation/start-operation";
import { Button } from "@/components/ui/button";
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

const formSchema = z.object({
  servicePoint: z
    .string()
    .min(1, { message: "Informe o ponto de atendimento." }),
});

interface StartOperationFormProps {
  onSuccess?: () => void;
  sectors: {
    id: string;
    name: string;
  }[];
}

const StartOperationForm = ({ onSuccess }: StartOperationFormProps) => {
  const [, setError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      servicePoint: "",
    },
  });

  const { execute, status } = useAction(startOperation, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        setError(result.data.error.message);
        return;
      }
      toast.success("Operação iniciada com sucesso!");
      setError(null);
      onSuccess?.();
      form.reset();
    },
    onError: (error) => {
      const msg =
        error.error?.serverError ||
        error.error?.validationErrors?.servicePoint?._errors?.[0] ||
        "Erro ao iniciar operação";
      toast.error(msg);
      setError(msg);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    execute({ servicePoint: values.servicePoint });
  };

  return (
    <DialogContent>
      <DialogTitle>Iniciar operação</DialogTitle>
      <DialogDescription>Selecione o ponto de atendimento.</DialogDescription>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="servicePoint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ponto de atendimento</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: Guichê 1, Balcão 2, etc."
                    disabled={status === "executing"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={status === "executing"}>
              {status === "executing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...
                </>
              ) : (
                "Iniciar operação"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default StartOperationForm;

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateUser } from "@/actions/update-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usersTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().trim().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres.",
  }),
  phoneNumber: z
    .string()
    .trim()
    .min(11, { message: "Informe um telefone válido." }),
  cpf: z.string().trim().min(11, { message: "Informe um CPF válido." }),
});

interface SettingsFormProps {
  user: Pick<
    typeof usersTable.$inferSelect,
    "id" | "name" | "cpf" | "phoneNumber"
  >;
}

const SettingsForm = ({ user }: SettingsFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      phoneNumber: user.phoneNumber,
      cpf: user.cpf,
    },
  });

  const { execute, status } = useAction(updateUser, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }

      toast.success("Informações atualizadas com sucesso!");
    },
    onError: (error) => {
      const message =
        error.error?.serverError ||
        error.error?.validationErrors?.cpf?._errors?.[0] ||
        error.error?.validationErrors?.name?._errors?.[0] ||
        error.error?.validationErrors?.phoneNumber?._errors?.[0] ||
        "Não foi possível atualizar seus dados.";

      toast.error(message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    execute({
      id: user.id,
      ...values,
    });
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="000.000.000-00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="p-0">
              <Button
                type="submit"
                className="w-full"
                disabled={status === "executing"}
              >
                {status === "executing" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingsForm;

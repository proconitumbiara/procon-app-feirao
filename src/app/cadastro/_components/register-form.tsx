"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const registerSchema = z.object({
  name: z.string().trim().min(3, { message: "Informe seu nome completo." }),
  cpf: z
    .string()
    .trim()
    .min(11, { message: "Informe um CPF válido." })
    .max(14, { message: "Informe um CPF válido." }),
  phoneNumber: z
    .string()
    .trim()
    .min(10, { message: "Informe um telefone válido." })
    .max(16, { message: "Informe um telefone válido." }),
  invitationCode: z
    .string()
    .trim()
    .min(1, { message: "Informe o código de convite." }),
});

const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cpfFromQuery = searchParams.get("cpf") ?? "";

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      cpf: cpfFromQuery,
      phoneNumber: "",
      invitationCode: "",
    },
  });

  useEffect(() => {
    const cpf = searchParams.get("cpf");
    if (cpf && cpf !== form.getValues("cpf")) {
      form.setValue("cpf", cpf);
    }
  }, [searchParams, form]);

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          body?.error || "Não foi possível concluir seu cadastro.",
        );
      }

      toast.success("Cadastro realizado com sucesso!");
      router.push("/setores");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao realizar cadastro.";
      toast.error(message);
    }
  }

  return (
    <Card className="mx-3 w-auto overflow-hidden border border-gray-200 bg-white p-0 shadow-sm">
      <CardContent className="grid p-0 text-center">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="mt-4 text-xl font-bold text-gray-900">
            Complete seu cadastro
          </CardTitle>
          <CardDescription className="text-sm font-extralight text-gray-900">
            Informe seus dados para continuar
          </CardDescription>
        </CardHeader>

        <div className="mx-auto w-full max-w-md p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">
                      Nome completo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu nome completo"
                        {...field}
                        className="text-primary border border-gray-200 bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
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
                    <FormLabel className="text-gray-900">CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu CPF"
                        {...field}
                        className="text-primary border border-gray-200 bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
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
                    <FormLabel className="text-gray-900">Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        className="text-primary border border-gray-200 bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invitationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900">
                      Código de convite
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Informe o código fornecido"
                        {...field}
                        className="text-primary border border-gray-200 bg-white shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="p-0">
                <Button
                  variant="default"
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Finalizar cadastro"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;

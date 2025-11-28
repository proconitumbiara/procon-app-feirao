"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

const loginSchema = z.object({
  cpf: z
    .string()
    .trim()
    .min(11, { message: "Informe um CPF válido." })
    .max(14, { message: "Informe um CPF válido." }),
});

const LoginForm = () => {
  const router = useRouter();
  const formLogin = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cpf: "",
    },
  });

  async function onSubmitLogin(values: z.infer<typeof loginSchema>) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.info("CPF não encontrado, finalize seu cadastro.");
          router.push(`/cadastro?cpf=${encodeURIComponent(values.cpf.trim())}`);
          return;
        }

        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error || "Não foi possível realizar o login.");
      }

      toast.success("Login realizado com sucesso!");
      router.push("/setores");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao realizar login.";
      toast.error(message);
    }
  }

  return (
    <Card className="mx-3 w-auto overflow-hidden border border-gray-200 bg-white p-0 shadow-sm">
      <CardContent className="grid p-0 text-center">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="mt-4 text-xl font-bold text-gray-900">
            Seja bem-vindo(a) de volta!
          </CardTitle>
          <CardDescription className="text-sm font-extralight text-gray-900">
            Faça login para continuar
          </CardDescription>
        </CardHeader>
        <div className="mx-auto w-full max-w-md p-6 md:p-8">
          <Form {...formLogin}>
            <form
              onSubmit={formLogin.handleSubmit(onSubmitLogin)}
              className="space-y-4"
            >
              <FormField
                control={formLogin.control}
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
              <CardFooter className="p-0">
                <Button
                  variant="default"
                  type="submit"
                  className="w-full"
                  disabled={formLogin.formState.isSubmitting}
                >
                  {formLogin.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
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

export default LoginForm;

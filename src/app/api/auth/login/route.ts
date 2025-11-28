import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { createSession, SESSION_COOKIE_NAME } from "@/lib/session";
import { digitsOnly } from "@/lib/utils";

const loginSchema = z.object({
  cpf: z
    .string()
    .trim()
    .min(11, "Informe um CPF válido.")
    .max(14, "Informe um CPF válido."),
});

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  const result = loginSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "Dados de login inválidos." },
      { status: 400 },
    );
  }

  try {
    const cpf = digitsOnly(result.data.cpf);

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.cpf, cpf),
    });

    if (!user) {
      return NextResponse.json(
        { error: "CPF não encontrado. Complete seu cadastro." },
        { status: 404 },
      );
    }

    const { token, expiresAt } = await createSession(user.id);

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        cpf: user.cpf,
      },
      expiresAt,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro ao criar sessão simples:", error);
    return NextResponse.json(
      { error: "Não foi possível realizar o login." },
      { status: 500 },
    );
  }
}

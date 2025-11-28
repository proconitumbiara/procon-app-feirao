import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { createSession, SESSION_COOKIE_NAME } from "@/lib/session";
import { digitsOnly } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().trim().min(3, "Informe um nome válido."),
  cpf: z
    .string()
    .trim()
    .min(11, "Informe um CPF válido.")
    .max(14, "Informe um CPF válido."),
  phoneNumber: z
    .string()
    .trim()
    .min(10, "Informe um telefone válido.")
    .max(16, "Informe um telefone válido."),
  invitationCode: z.string().trim().min(1, "Informe o código de convite."),
});

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  const result = registerSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "Dados de cadastro inválidos." },
      { status: 400 },
    );
  }

  try {
    const expectedInvitationCode = process.env.INVITATION_CODE;

    if (!expectedInvitationCode) {
      console.error("INVITATION_CODE não configurado no ambiente.");
      return NextResponse.json(
        { error: "Configuração de convite ausente." },
        { status: 500 },
      );
    }

    if (result.data.invitationCode.trim() !== expectedInvitationCode) {
      return NextResponse.json(
        { error: "Código de convite inválido." },
        { status: 401 },
      );
    }

    const name = result.data.name.trim();
    const cpf = digitsOnly(result.data.cpf);
    const phoneNumber = digitsOnly(result.data.phoneNumber);

    const now = new Date();

    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.cpf, cpf),
    });

    let user = existingUser;

    if (!user) {
      const [created] = await db
        .insert(usersTable)
        .values({
          id: randomUUID(),
          name,
          cpf,
          phoneNumber,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      user = created;
    } else {
      const [updated] = await db
        .update(usersTable)
        .set({
          name,
          phoneNumber,
          updatedAt: now,
        })
        .where(eq(usersTable.id, user.id))
        .returning();

      user = updated ?? user;
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
    console.error("Erro ao processar cadastro:", error);
    return NextResponse.json(
      { error: "Não foi possível concluir o cadastro." },
      { status: 500 },
    );
  }
}

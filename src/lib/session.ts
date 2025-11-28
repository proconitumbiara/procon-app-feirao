import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { db } from "@/db";
import { sessionsTable, usersTable } from "@/db/schema";

export const SESSION_COOKIE_NAME = "procon_session";
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24h

export type SessionWithUser = {
  session: typeof sessionsTable.$inferSelect;
  user: typeof usersTable.$inferSelect;
};

async function getSessionByToken(
  token?: string | null,
): Promise<SessionWithUser | null> {
  if (!token) return null;

  const session = await db.query.sessionsTable.findFirst({
    where: eq(sessionsTable.token, token),
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
    return null;
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.userId),
  });

  if (!user) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));
    return null;
  }

  return { session, user };
}

export async function createSession(userId: string) {
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  const token = randomUUID();

  const [session] = await db
    .insert(sessionsTable)
    .values({
      id: randomUUID(),
      token,
      userId,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return { session, token, expiresAt };
}

export async function destroySession(token?: string | null) {
  if (!token) return;
  await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getSessionByToken(token);
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return getSessionByToken(token);
}

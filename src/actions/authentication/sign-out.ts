"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { destroySession, SESSION_COOKIE_NAME } from "@/lib/session";

export async function signOut() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  await destroySession(token);

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/");
}

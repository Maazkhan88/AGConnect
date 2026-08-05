"use server";

import { redirect } from "next/navigation";
import { destroySessionCookie } from "@/lib/auth/session";

export async function logoutAction() {
  await destroySessionCookie();
  redirect("/admin/login");
}

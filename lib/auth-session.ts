import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getServerSession() {
  try {
    const reqHeaders = await headers();
    return await auth.api.getSession({ headers: reqHeaders });
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  const session = await getServerSession();
  return session?.user ?? null;
}

export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Acesso não autorizado. Sessão expirada ou inválida.");
  }
  return user;
}

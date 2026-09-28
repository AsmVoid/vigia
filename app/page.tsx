import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (session) {
      redirect("/dashboard");
    }
  } catch {
    // If error retrieving session, fallback to login
  }

  redirect("/login");
}

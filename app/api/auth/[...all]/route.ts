import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

if (process.env.NODE_ENV === "development") {
  console.log("[Better Auth] env check:", {
    hasDb: !!process.env.DATABASE_URL,
    hasSecret: !!((process.env.BETTER_AUTH_SECRET?.length ?? 0) > 16),
    hasUrl: !!process.env.BETTER_AUTH_URL,
  });
}

export const { GET, POST } = toNextJsHandler(auth.handler);

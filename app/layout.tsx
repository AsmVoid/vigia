import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "V.I.G.I.A — Open-Source Intelligence",
  description:
    "Plataforma OSINT self-hosted para dossiês, grafos de relações e enriquecimento de dados.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get("vigia-theme")?.value;
  const initialTheme = themeCookie === "light" ? "light" : "dark";

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${initialTheme} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <ThemeProvider
          attribute="class"
          defaultTheme={initialTheme}
          enableSystem={false}
          disableTransitionOnChange
          enableColorScheme={false}
        >
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              className: "font-sans glass border-border/70 text-foreground shadow-xl rounded-2xl",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

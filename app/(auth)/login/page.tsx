"use client";

import * as React from "react";
import * as motion from "motion/react-client";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/shared/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthStep = "credentials" | "totp";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [step, setStep] = React.useState<AuthStep>(() => {
    return searchParams.get("step") === "totp" ? "totp" : "credentials";
  });
  const [isBackupMode, setIsBackupMode] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [totpCode, setTotpCode] = React.useState("");
  const [backupCode, setBackupCode] = React.useState("");
  const [trustDevice, setTrustDevice] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (searchParams.get("panic") === "true") {
      toast.error("Sessão destruída com sucesso. Protocolo de emergência acionado.");
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      });

      // 1. Check if 2FA is required (twoFactorRedirect: true returned in result.data)
      const data = result.data as { twoFactorRedirect?: boolean; twoFactorMethods?: string[] } | null;
      if (data?.twoFactorRedirect) {
        setStep("totp");
        try {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set("step", "totp");
          window.history.replaceState(null, "", currentUrl.toString());
        } catch {
          // ignore
        }
        toast.info("Autenticação de dois fatores necessária. Digite o código gerado no seu app autenticador.");
        setLoading(false);
        return;
      }

      // 2. Check for errors
      if (result.error) {
        // Fallback check if 2FA is required via error
        if (
          result.error.status === 403 &&
          (result.error.message?.toLowerCase().includes("two factor") ||
            (result.error as any).code === "TWO_FACTOR_REDIRECT")
        ) {
          setStep("totp");
          try {
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set("step", "totp");
            window.history.replaceState(null, "", currentUrl.toString());
          } catch {
            // ignore
          }
          toast.info("Autenticação de dois fatores necessária.");
          setLoading(false);
          return;
        }
        toast.error(result.error.message ?? "Credenciais inválidas.");
        setLoading(false);
        return;
      }

      // 3. Normal login success (no 2FA)
      toast.success("Login realizado com sucesso!");
      window.location.href = callbackUrl;
    } catch {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTotpVerify(e: React.FormEvent) {
    e.preventDefault();
    if (totpCode.length !== 6) {
      toast.error("O código TOTP deve ter 6 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.twoFactor.verifyTotp({
        code: totpCode,
        trustDevice,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Código 2FA incorreto ou expirado.");
        setLoading(false);
        return;
      }

      toast.success("Autenticação concluída com sucesso!");
      window.location.href = callbackUrl;
    } catch {
      toast.error("Erro na verificação do 2FA. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBackupVerify(e: React.FormEvent) {
    e.preventDefault();
    const clean = backupCode.trim();
    if (!clean) {
      toast.error("Insira o código de recuperação.");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.twoFactor.verifyBackupCode({
        code: clean,
        trustDevice,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Código de recuperação inválido.");
        setLoading(false);
        return;
      }

      toast.success("Autenticação com código de recuperação realizada!");
      window.location.href = callbackUrl;
    } catch {
      toast.error("Erro na verificação do código de backup.");
    } finally {
      setLoading(false);
    }
  }

  const handleBackToCredentials = () => {
    setStep("credentials");
    setTotpCode("");
    setBackupCode("");
    setIsBackupMode(false);
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete("step");
      window.history.replaceState(null, "", currentUrl.toString());
    } catch {
      // ignore
    }
  };

  return (
    <AuthCard
      title={
        step === "credentials"
          ? "Acessar Sistema"
          : isBackupMode
            ? "Código de Recuperação"
            : "Verificação de Segurança"
      }
      subtitle={
        step === "credentials"
          ? "Entre com suas credenciais"
          : isBackupMode
            ? "Digite um código de backup de uso único"
            : "Confirmação de dois fatores (2FA)"
      }
    >
      {step === "credentials" ? (
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="investigador@vigia.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl bg-background/50 backdrop-blur-sm"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="login-password">Senha</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl bg-background/50 pr-10 backdrop-blur-sm"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ig-gradient font-semibold text-white shadow-lg transition-shadow hover:shadow-xl hover:glow-ig disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Entrar"
            )}
          </motion.button>

          {/* Register link & Acronym */}
          <div className="space-y-2 text-center pt-1">
            <p className="text-sm text-muted-foreground">
              Não tem conta?{" "}
              <motion.a
                href="/register"
                className="font-medium text-ig-gradient transition-opacity hover:opacity-80"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                Criar conta
              </motion.a>
            </p>
          </div>
        </form>
      ) : isBackupMode ? (
        /* Backup Code Step */
        <motion.form
          onSubmit={handleBackupVerify}
          className="space-y-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
            <KeyRound className="size-8 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Código de Recuperação
              </p>
              <p className="text-xs text-muted-foreground">
                Digite um código de backup para acessar a conta
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-code">Código de Backup</Label>
            <Input
              id="backup-code"
              type="text"
              placeholder="Ex: a1b2c-d3e4f"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
              className="h-11 rounded-xl bg-background/50 text-center font-mono text-lg tracking-widest backdrop-blur-sm"
              autoFocus
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="rounded border-border/60 bg-background/50 text-primary accent-primary size-3.5"
            />
            <span>Lembrar deste dispositivo por 30 dias</span>
          </label>

          <motion.button
            type="submit"
            disabled={loading || !backupCode.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ig-gradient font-semibold text-white shadow-lg transition-shadow hover:shadow-xl hover:glow-ig disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Validar Código de Recuperação"
            )}
          </motion.button>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsBackupMode(false);
                setBackupCode("");
              }}
              className="w-full text-center text-xs text-primary/80 hover:text-primary transition-colors"
            >
              Usar código do aplicativo autenticador (TOTP)
            </button>

            <button
              type="button"
              onClick={handleBackToCredentials}
              className="flex items-center justify-center gap-1.5 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Voltar ao login com senha
            </button>
          </div>
        </motion.form>
      ) : (
        /* 2FA TOTP Step */
        <motion.form
          onSubmit={handleTotpVerify}
          className="space-y-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-primary/10 border border-primary/20 p-4">
            <Shield className="size-8 text-primary shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Verificação em duas etapas (2FA)
              </p>
              <p className="text-xs text-muted-foreground">
                Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="totp-code">Código TOTP</Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {totpCode.length}/6 dígitos
              </span>
            </div>
            <Input
              id="totp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={totpCode}
              onChange={(e) =>
                setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="h-12 rounded-xl bg-background/50 text-center font-mono text-2xl font-bold tracking-[0.5em] backdrop-blur-sm"
              autoFocus
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={trustDevice}
              onChange={(e) => setTrustDevice(e.target.checked)}
              className="rounded border-border/60 bg-background/50 text-primary accent-primary size-3.5"
            />
            <span>Lembrar deste dispositivo por 30 dias</span>
          </label>

          <motion.button
            type="submit"
            disabled={loading || totpCode.length !== 6}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ig-gradient font-semibold text-white shadow-lg transition-shadow hover:shadow-xl hover:glow-ig disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Confirmar Acesso"
            )}
          </motion.button>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setIsBackupMode(true);
                setTotpCode("");
              }}
              className="w-full text-center text-xs text-primary/80 hover:text-primary transition-colors"
            >
              Problemas com o app? Usar código de recuperação
            </button>

            <button
              type="button"
              onClick={handleBackToCredentials}
              className="flex items-center justify-center gap-1.5 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" /> Voltar ao login com senha
            </button>
          </div>
        </motion.form>
      )}
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-primary" />
        </main>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}

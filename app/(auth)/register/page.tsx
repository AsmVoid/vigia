"use client";

import * as React from "react";
import * as motion from "motion/react-client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AuthCard } from "@/components/shared/auth-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }

    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        username,
        name: username,
        email,
        password,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Erro ao criar conta.");
        setLoading(false);
        return;
      }

      toast.success("Conta criada com sucesso!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Erro ao registrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Criar Conta" subtitle="Registre-se para acessar o sistema">
      <form onSubmit={handleRegister} className="space-y-5">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="register-username">Usuário</Label>
          <Input
            id="register-username"
            type="text"
            placeholder="investigador"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-11 rounded-xl bg-background/50 backdrop-blur-sm"
            autoComplete="username"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
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
          <Label htmlFor="register-password">Senha</Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl bg-background/50 pr-10 backdrop-blur-sm"
              autoComplete="new-password"
              minLength={8}
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="register-confirm">Confirmar Senha</Label>
          <Input
            id="register-confirm"
            type={showPassword ? "text" : "password"}
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-11 rounded-xl bg-background/50 backdrop-blur-sm"
            autoComplete="new-password"
            minLength={8}
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-xs text-destructive"
            >
              As senhas não coincidem
            </motion.p>
          )}
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
            "Criar Conta"
          )}
        </motion.button>

        {/* Login link & Acronym */}
        <div className="space-y-2 text-center pt-1">
          <p className="text-sm text-muted-foreground">
            Já tem conta?{" "}
            <motion.a
              href="/login"
              className="font-medium text-ig-gradient transition-opacity hover:opacity-80"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              Fazer login
            </motion.a>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}

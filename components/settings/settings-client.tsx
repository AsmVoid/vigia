"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Settings,
  User,
  Shield,
  Key,
  Palette,
  AlertTriangle,
  Upload,
  Loader2,
  Check,
  Download,
  Flame,
  QrCode,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Laptop,
  Copy,
  CheckCheck,
} from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IgAvatar } from "@/components/shared/ig-avatar";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  updateProfileAction,
  exportDatabaseBackupAction,
} from "@/app/(dashboard)/settings/actions";
import { triggerBurnerCleanupAction } from "@/app/(dashboard)/entity/actions";

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    photo?: string | null;
    twoFactorEnabled: boolean;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Profile State
  const [displayName, setDisplayName] = React.useState(user.displayName || user.username);
  const [photo, setPhoto] = React.useState(user.photo || "");
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [savingProfile, setSavingProfile] = React.useState(false);

  // 2. Password State
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);

  // 3. 2FA TOTP State
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(user.twoFactorEnabled);
  const [totpPassword, setTotpPassword] = React.useState("");
  const [totpUri, setTotpUri] = React.useState<string | null>(null);
  const [totpCode, setTotpCode] = React.useState("");
  const [totpLoading, setTotpLoading] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = React.useState(false);

  // Generate QR Code data URL when totpUri is available
  React.useEffect(() => {
    if (totpUri) {
      QRCode.toDataURL(totpUri, {
        width: 240,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => {
          console.error("Erro ao gerar QR Code TOTP:", err);
          setQrDataUrl(null);
        });
    } else {
      setQrDataUrl(null);
    }
  }, [totpUri]);

  // Extract secret key from otpauth URI
  const totpSecret = React.useMemo(() => {
    if (!totpUri) return null;
    return totpUri.match(/secret=([A-Z0-9]+)/i)?.[1] || null;
  }, [totpUri]);

  const handleCopySecret = () => {
    if (!totpSecret) return;
    navigator.clipboard.writeText(totpSecret);
    setCopiedSecret(true);
    toast.success("Chave secreta copiada para a área de transferência!");
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // 4. Danger Zone State
  const [cleaningBurners, setCleaningBurners] = React.useState(false);
  const [exportingBackup, setExportingBackup] = React.useState(false);

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfileAction({ displayName, photo });
      if (res.success) {
        toast.success("Perfil atualizado com sucesso!");
        router.refresh();
      } else {
        toast.error(res.error || "Falha ao atualizar perfil.");
      }
    } catch {
      toast.error("Erro ao salvar dados de perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Falha no envio da foto");
      }

      const data = await res.json();
      setPhoto(data.url);
      toast.success("Foto enviada com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro no upload da foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Informe a senha atual e a nova senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A confirmação de senha não confere.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res.error) {
        toast.error(res.error.message || "Falha ao alterar senha.");
      } else {
        toast.success("Senha alterada com sucesso!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("Erro na comunicação com o servidor.");
    } finally {
      setSavingPassword(false);
    }
  };

  // Enable 2FA (Step 1: request TOTP URI)
  const handleEnable2fa = async () => {
    if (!totpPassword) {
      toast.error("Informe sua senha atual para configurar 2FA.");
      return;
    }

    setTotpLoading(true);
    try {
      const res = await authClient.twoFactor.enable({
        password: totpPassword,
      });

      if (res.error) {
        toast.error(res.error.message || "Senha incorreta.");
      } else if (res.data && "totpURI" in res.data && res.data.totpURI) {
        setTotpUri(res.data.totpURI);
        toast.info("Escaneie o QR Code ou insira o segredo no app autenticador.");
      } else {
        setTwoFactorEnabled(true);
        toast.success("Autenticação de dois fatores ativada!");
      }
    } catch {
      toast.error("Erro ao ativar 2FA.");
    } finally {
      setTotpLoading(false);
    }
  };

  // Verify TOTP Code (Step 2)
  const handleVerifyTotp = async () => {
    if (!totpCode || totpCode.length < 6) {
      toast.error("Código TOTP deve ter 6 dígitos.");
      return;
    }

    setTotpLoading(true);
    try {
      const res = await authClient.twoFactor.verifyTotp({
        code: totpCode,
      });

      if (res.error) {
        toast.error(res.error.message || "Código incorreto. Tente novamente.");
      } else {
        setTwoFactorEnabled(true);
        setTotpUri(null);
        setTotpPassword("");
        setTotpCode("");
        toast.success("2FA verificado e ativado com sucesso!");
      }
    } catch {
      toast.error("Erro ao verificar código TOTP.");
    } finally {
      setTotpLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2fa = async () => {
    if (!totpPassword) {
      toast.error("Informe sua senha para desativar 2FA.");
      return;
    }

    setTotpLoading(true);
    try {
      const res = await authClient.twoFactor.disable({
        password: totpPassword,
      });

      if (res.error) {
        toast.error(res.error.message || "Senha incorreta.");
      } else {
        setTwoFactorEnabled(false);
        setTotpPassword("");
        setTotpUri(null);
        toast.success("2FA desativado.");
      }
    } catch {
      toast.error("Erro ao desativar 2FA.");
    } finally {
      setTotpLoading(false);
    }
  };

  // Manual Burner Cleanup
  const handleTriggerBurnerCleanup = async () => {
    setCleaningBurners(true);
    try {
      const res = await triggerBurnerCleanupAction();
      if (res.success) {
        if (res.count > 0) {
          toast.success(
            `Limpeza concluída! ${res.count} alvo(s) temporário(s) expurgado(s): ${res.deletedNames.join(", ")}`
          );
        } else {
          toast.info("Nenhuma entidade temporária com prazo expirado no momento.");
        }
      } else {
        toast.error(res.error || "Falha na execução da limpeza.");
      }
    } catch {
      toast.error("Erro ao executar limpeza.");
    } finally {
      setCleaningBurners(false);
    }
  };

  // Export JSON Backup
  const handleExportBackup = async () => {
    setExportingBackup(true);
    try {
      const res = await exportDatabaseBackupAction();
      if (res.success && res.backupJson) {
        const blob = new Blob([res.backupJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = res.filename || "VIGIA-Backup.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Backup completo em JSON gerado e baixado!");
      } else {
        toast.error(res.error || "Falha ao gerar backup.");
      }
    } catch {
      toast.error("Erro ao processar backup.");
    } finally {
      setExportingBackup(false);
    }
  };

  // Panic Button Action
  const handleEmergencyPanic = async () => {
    toast.error("Destruindo sessão...");
    try {
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      await authClient.signOut();
    } catch {
      // Ignored
    } finally {
      window.location.href = "/login?panic=true";
    }
  };

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8 max-w-4xl mx-auto font-mono text-xs">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 font-sans">
          <span className="p-2 rounded-2xl bg-ig-gradient text-white shadow-md glow-ig-sm">
            <Settings className="size-5" />
          </span>
          Configurações do Sistema
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-mono">
          Gerenciamento de perfil investigativo, segurança criptográfica, aparência e operações críticas.
        </p>
      </div>

      {/* 1. SEÇÃO PERFIL */}
      <div className="glass rounded-3xl p-6 border border-border/50 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold border-b border-border/40 pb-3 text-sm font-sans">
          <User className="size-4 text-primary" />
          <span>Perfil do Investigador</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <IgAvatar
                src={photo}
                alt={displayName}
                fallback={initials}
                size="md"
                fallbackClassName="text-base font-bold"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="photoUpload"
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-border/60 hover:border-primary text-xs font-semibold text-foreground transition-all shadow-sm"
              >
                {uploadingPhoto ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Upload className="size-3.5 text-primary" />
                )}
                <span>Alterar Foto</span>
              </label>
              <input
                id="photoUpload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
              <p className="text-[10px] text-muted-foreground">PNG, JPG ou WebP até 10MB</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Nome de Exibição:</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-9 rounded-xl bg-card/60 border-border/50 text-xs"
                placeholder="Ex: Agente Carlos"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Nome de Usuário (Identificador):</Label>
              <Input
                value={user.username}
                disabled
                className="h-9 rounded-xl bg-muted/40 border-border/40 text-xs text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-[11px] text-muted-foreground">E-mail Cadastrado:</Label>
              <Input
                value={user.email}
                disabled
                className="h-9 rounded-xl bg-muted/40 border-border/40 text-xs text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={savingProfile || uploadingPhoto}
              className="rounded-xl bg-ig-gradient hover:opacity-90 text-white text-xs font-semibold h-9 px-4 shadow-md glow-ig-sm"
            >
              {savingProfile ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
              Salvar Perfil
            </Button>
          </div>
        </form>
      </div>

      {/* 2. SEÇÃO SEGURANÇA (SENHA + 2FA TOTP) */}
      <div className="glass rounded-3xl p-6 border border-border/50 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-foreground font-bold border-b border-border/40 pb-3 text-sm font-sans">
          <Shield className="size-4 text-primary" />
          <span>Segurança & Autenticação de Dois Fatores (2FA)</span>
        </div>

        {/* 2FA TOTP Status */}
        <div className="p-4 rounded-2xl bg-muted/20 border border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground block">
                Autenticação de Dois Fatores (TOTP)
              </span>
              <p className="text-[11px] text-muted-foreground">
                Exige um código de 6 dígitos gerado no Google Authenticator / Authy a cada login.
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                twoFactorEnabled
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-muted text-muted-foreground border-border/50"
              }`}
            >
              {twoFactorEnabled ? "● ATIVADO" : "○ DESATIVADO"}
            </span>
          </div>

          {/* Configurar / Ativar 2FA */}
          {!twoFactorEnabled && !totpUri && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
              <Input
                type="password"
                placeholder="Sua senha atual"
                value={totpPassword}
                onChange={(e) => setTotpPassword(e.target.value)}
                className="h-8 max-w-xs rounded-xl bg-card/60 border-border/50 text-xs"
              />
              <Button
                type="button"
                onClick={handleEnable2fa}
                disabled={totpLoading || !totpPassword}
                className="h-8 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {totpLoading ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
                Ativar 2FA
              </Button>
            </div>
          )}

          {/* QR Code / Verificação de Código TOTP */}
          {!twoFactorEnabled && totpUri && (
            <div className="p-4 rounded-2xl bg-card/90 border border-primary/40 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <QrCode className="size-4" />
                  <span>Escaneie no seu app autenticador</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTotpUri(null);
                    setTotpCode("");
                  }}
                  className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </Button>
              </div>

              {/* QR Code Display Card */}
              <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl shadow-md border border-border/40 max-w-[220px] mx-auto">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code TOTP 2FA"
                    className="size-44 object-contain rounded-lg"
                  />
                ) : (
                  <div className="size-44 flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                )}
                <span className="text-[10px] text-zinc-600 font-semibold mt-1">
                  TOTP 2FA • V.I.G.I.A
                </span>
              </div>

              {/* Manual Secret Key */}
              {totpSecret && (
                <div className="space-y-1.5 text-center">
                  <span className="text-[11px] text-muted-foreground block font-medium">
                    Ou insira a chave manualmente no seu aplicativo:
                  </span>
                  <div className="inline-flex items-center gap-2 p-1.5 px-3 rounded-xl bg-muted/60 border border-border/60 max-w-full">
                    <code className="font-mono text-xs font-bold tracking-wider text-primary select-all break-all">
                      {totpSecret}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleCopySecret}
                      className="size-6 text-muted-foreground hover:text-foreground shrink-0"
                      title="Copiar chave secreta"
                    >
                      {copiedSecret ? (
                        <CheckCheck className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Code Verification Form */}
              <div className="pt-3 border-t border-border/40 space-y-2">
                <span className="text-xs font-semibold text-foreground block text-center">
                  Digite o código de 6 dígitos gerado pelo aplicativo:
                </span>
                <div className="flex items-center justify-center gap-2">
                  <Input
                    placeholder="000000"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-10 w-44 rounded-xl bg-card border-border/60 text-center font-bold tracking-widest text-base shadow-sm focus-visible:ring-emerald-500"
                    autoFocus
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyTotp}
                    disabled={totpLoading || totpCode.length !== 6}
                    className="h-10 px-4 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all gap-1.5 cursor-pointer"
                  >
                    {totpLoading ? <Loader2 className="size-3.5 animate-spin" /> : null}
                    <span>Confirmar e Ativar</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Desativar 2FA */}
          {twoFactorEnabled && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
              <Input
                type="password"
                placeholder="Senha atual para desativar"
                value={totpPassword}
                onChange={(e) => setTotpPassword(e.target.value)}
                className="h-8 max-w-xs rounded-xl bg-card/60 border-border/50 text-xs"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={handleDisable2fa}
                disabled={totpLoading || !totpPassword}
                className="h-8 text-xs rounded-xl"
              >
                Desativar 2FA
              </Button>
            </div>
          )}
        </div>

        {/* Alterar Senha */}
        <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
          <span className="text-xs font-bold text-foreground block">Alterar Senha de Acesso</span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Senha Atual:</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-8 rounded-xl bg-card/60 border-border/50 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Nova Senha (min 8 chars):</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-8 rounded-xl bg-card/60 border-border/50 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Confirmar Nova Senha:</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-8 rounded-xl bg-card/60 border-border/50 text-xs"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
              <span>{showPassword ? "Ocultar senhas" : "Ver senhas digitadas"}</span>
            </button>

            <Button
              type="submit"
              disabled={savingPassword || !newPassword}
              className="rounded-xl glass border-border/60 hover:border-primary text-xs font-semibold h-8 px-4 text-foreground"
            >
              {savingPassword ? <Loader2 className="size-3 animate-spin mr-1" /> : null}
              Salvar Nova Senha
            </Button>
          </div>
        </form>
      </div>

      {/* 3. SEÇÃO APARÊNCIA */}
      <div className="glass rounded-3xl p-6 border border-border/50 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold border-b border-border/40 pb-3 text-sm font-sans">
          <Palette className="size-4 text-primary" />
          <span>Aparência & Tema da Interface</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-2xl glass border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
              mounted && theme === "dark"
                ? "border-primary bg-primary/10 shadow-md glow-ig-sm"
                : "border-border/50 hover:border-border"
            }`}
          >
            <Moon className="size-6 text-purple-400" />
            <div>
              <span className="font-bold text-xs text-foreground block">BLACK OLED</span>
              <span className="text-[10px] text-muted-foreground">Fundo preto puro (#000000)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-4 rounded-2xl glass border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
              mounted && theme === "light"
                ? "border-primary bg-primary/10 shadow-md glow-ig-sm"
                : "border-border/50 hover:border-border"
            }`}
          >
            <Sun className="size-6 text-amber-400" />
            <div>
              <span className="font-bold text-xs text-foreground block">WHITE OLED</span>
              <span className="text-[10px] text-muted-foreground">Tema claro de alto contraste</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`p-4 rounded-2xl glass border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
              mounted && (theme === "system" || !theme)
                ? "border-primary bg-primary/10 shadow-md glow-ig-sm"
                : "border-border/50 hover:border-border"
            }`}
          >
            <Laptop className="size-6 text-blue-400" />
            <div>
              <span className="font-bold text-xs text-foreground block">Sistema Operacional</span>
              <span className="text-[10px] text-muted-foreground">Acompanha preferência do OS</span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. SEÇÃO ZONA DE PERIGO & OPERAÇÕES CRÍTICAS */}
      <div className="rounded-3xl p-6 border-2 border-destructive/40 glass shadow-md space-y-4 bg-destructive/5">
        <div className="flex items-center gap-2 text-destructive font-bold border-b border-destructive/30 pb-3 text-sm font-sans">
          <AlertTriangle className="size-4" />
          <span>Zona de Perigo & Operações Críticas</span>
        </div>

        <div className="space-y-4">
          {/* Burner Cleanup Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card/60 border border-border/40">
            <div>
              <span className="font-bold text-foreground text-xs block">
                Limpeza Manual de Alvos Burner Expirados
              </span>
              <p className="text-[10px] text-muted-foreground">
                Executa imediatamente o expurgo permanente de pessoas cujo prazo de validade expirou.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTriggerBurnerCleanup}
              disabled={cleaningBurners}
              className="h-8 rounded-xl border-amber-500/50 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold gap-1.5"
            >
              {cleaningBurners ? <Loader2 className="size-3.5 animate-spin" /> : <Flame className="size-3.5" />}
              <span>Expurgar Burners</span>
            </Button>
          </div>

          {/* Database Export Backup */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-card/60 border border-border/40">
            <div>
              <span className="font-bold text-foreground text-xs block">
                Exportar Backup Completo da Base (JSON)
              </span>
              <p className="text-[10px] text-muted-foreground">
                Gera um snapshot integral com todas as entidades, contatos, vínculos e logs criptografados.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportBackup}
              disabled={exportingBackup}
              className="h-8 rounded-xl glass border-border/60 hover:border-primary text-foreground text-xs font-semibold gap-1.5"
            >
              {exportingBackup ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5 text-primary" />}
              <span>Exportar Base (.JSON)</span>
            </Button>
          </div>

          {/* Panic Protocol Immediate */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-destructive/15 border border-destructive/40">
            <div>
              <span className="font-bold text-destructive text-xs block">
                🚨 Protocolo de Pânico Instantâneo
              </span>
              <p className="text-[10px] text-muted-foreground">
                Invalida a sessão imediatamente, apaga chaves locais de storage e redireciona ao login. (Atalho: Ctrl+Shift+Esc)
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleEmergencyPanic}
              className="h-8 rounded-xl text-xs font-semibold gap-1.5"
            >
              <AlertTriangle className="size-3.5" />
              <span>Acionar Pânico</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

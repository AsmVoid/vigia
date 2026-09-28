import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("ENCRYPTION_KEY deve ter 64 chars hex. Gere: openssl rand -hex 32");
  }
  return Buffer.from(key, "hex");
}

export interface EncryptedPayload {
  encrypted: string;
  iv: string;
  tag: string;
}

export function encrypt(text: string): EncryptedPayload {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encrypted, iv: iv.toString("hex"), tag: cipher.getAuthTag().toString("hex") };
}

export function decrypt(payload: EncryptedPayload): string {
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(payload.iv, "hex"));
  decipher.setAuthTag(Buffer.from(payload.tag, "hex"));
  let decrypted = decipher.update(payload.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function encryptToString(text: string): string {
  if (!text) return "";
  const payload = encrypt(text);
  return JSON.stringify(payload);
}

export function decryptFromString(value: string): string {
  if (!value) return "";
  try {
    const payload = JSON.parse(value);
    if (payload && payload.encrypted && payload.iv && payload.tag) {
      return decrypt(payload);
    }
    return value;
  } catch {
    return value;
  }
}


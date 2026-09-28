import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-matroska", // .mkv
  "video/ogg",
  "video/avi",
  "video/mpeg",
]);

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado ou formato inválido." },
        { status: 400 }
      );
    }

    const mime = file.type.toLowerCase();
    const isImage = ALLOWED_IMAGE_MIMES.has(mime) || mime.startsWith("image/");
    const isVideo = ALLOWED_VIDEO_MIMES.has(mime) || mime.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error:
            "Tipo de arquivo não permitido. Envie uma imagem (JPG, PNG, WEBP, GIF) ou vídeo (MP4, WEBM, MOV).",
        },
        { status: 400 }
      );
    }

    const maxImageMb = parseInt(process.env.VIGIA_MAX_IMAGE_MB || "50", 10);
    const maxVideoMb = parseInt(process.env.VIGIA_MAX_VIDEO_MB || "200", 10);

    const maxMb = isVideo ? maxVideoMb : maxImageMb;
    const maxBytes = maxMb * 1024 * 1024;

    if (file.size > maxBytes) {
      const typeLabel = isVideo ? "Vídeo" : "Imagem";
      return NextResponse.json(
        { error: `${typeLabel} excede o limite máximo de ${maxMb}MB.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg");
    const filename = `${Date.now()}-${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads", "people");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    const url = `/uploads/people/${filename}`;

    return NextResponse.json({
      url,
      filename,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Erro no upload de arquivo:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar upload do arquivo." },
      { status: 500 }
    );
  }
}

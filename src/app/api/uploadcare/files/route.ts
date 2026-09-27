import { NextResponse } from "next/server";
import { getPrefixedCdnBaseSync } from "@uploadcare/cname-prefix";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "";
const SECRET_KEY = process.env.UPLOADCARE_SECRET_KEY || "";

function getCdnBase(): string {
  try {
    if (PUBLIC_KEY) {
      return getPrefixedCdnBaseSync(PUBLIC_KEY, "https://ucarecd.net");
    }
  } catch {}
  return "https://ucarecdn.com";
}

/**
 * GET /api/uploadcare/files
 * Fetch list of uploaded audio files from Uploadcare project
 */
export async function GET() {
  if (!PUBLIC_KEY || !SECRET_KEY) {
    return NextResponse.json(
      { error: "Uploadcare credentials not configured on server" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch("https://api.uploadcare.com/files/?limit=100&stored=all", {
      headers: {
        Accept: "application/vnd.uploadcare-v0.7+json",
        Authorization: `Uploadcare.Simple ${PUBLIC_KEY}:${SECRET_KEY}`,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch files from CDN repository" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const cdnBase = getCdnBase();

    const files = (data.results || []).map((file: {
      uuid: string;
      original_filename?: string;
      size?: number;
      mime_type?: string;
      is_image?: boolean;
      datetime_uploaded?: string;
    }) => ({
      uuid: file.uuid,
      name: (file.original_filename || "audio_track.mp3").slice(0, 128),
      size: file.size,
      mimeType: file.mime_type,
      isImage: file.is_image,
      cdnUrl: `${cdnBase}/${file.uuid}/`,
      streamUrl: `${cdnBase}/${file.uuid}/${encodeURIComponent(file.original_filename || "audio.mp3")}`,
      datetimeUploaded: file.datetime_uploaded,
    }));

    return NextResponse.json({
      total: data.total,
      cdnBase,
      files,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { error: "Error fetching Uploadcare files", details: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/uploadcare/files?uuid=...
 * Delete a file from Uploadcare project - Restricted to authorized administrators
 */
export async function DELETE(request: Request) {
  if (!PUBLIC_KEY || !SECRET_KEY) {
    return NextResponse.json(
      { error: "Uploadcare credentials not configured on server" },
      { status: 503 }
    );
  }

  // Cloudflare Security Audit: Require Admin / Owner Authorization
  const authHeader = request.headers.get("authorization") || "";
  const adminSecret = process.env.ADMIN_SECRET_KEY || process.env.TELEGRAM_BOT_TOKEN;
  const isAuthorized = adminSecret ? authHeader === `Bearer ${adminSecret}` : false;

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized: File deletion requires administrative privileges" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawUuid = searchParams.get("uuid") || "";

    // Strict UUID format validation: prevents path traversal and SSRF
    const uuid = rawUuid.trim().toLowerCase();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    if (!uuidRegex.test(uuid)) {
      return NextResponse.json({ error: "Invalid file UUID format" }, { status: 400 });
    }

    const res = await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.uploadcare-v0.7+json",
        Authorization: `Uploadcare.Simple ${PUBLIC_KEY}:${SECRET_KEY}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to delete file from Uploadcare" },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, uuid });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { error: "Error deleting Uploadcare file", details: message },
      { status: 500 }
    );
  }
}

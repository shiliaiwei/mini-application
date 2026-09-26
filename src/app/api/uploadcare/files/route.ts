import { NextResponse } from "next/server";
import { getPrefixedCdnBaseSync } from "@uploadcare/cname-prefix";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "ccaefc44640da9c67ac4";
const SECRET_KEY = process.env.UPLOADCARE_SECRET_KEY || "b2c0bc9e5620bff0048c";

function getCdnBase(): string {
  try {
    return getPrefixedCdnBaseSync(PUBLIC_KEY, "https://ucarecd.net");
  } catch {
    return "https://ucarecdn.com";
  }
}

/**
 * GET /api/uploadcare/files
 * Fetch list of uploaded audio files from Uploadcare project using REST API with Secret Key
 */
export async function GET() {
  try {
    const res = await fetch("https://api.uploadcare.com/files/?limit=100&stored=all", {
      headers: {
        Accept: "application/vnd.uploadcare-v0.7+json",
        Authorization: `Uploadcare.Simple ${PUBLIC_KEY}:${SECRET_KEY}`,
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "Failed to fetch files from Uploadcare", details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    const cdnBase = getCdnBase();

    const files = (data.results || []).map((file: any) => ({
      uuid: file.uuid,
      name: file.original_filename || "audio_track.mp3",
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
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error fetching Uploadcare files", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/uploadcare/files?uuid=...
 * Delete a file from Uploadcare project using Secret Key
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json({ error: "Missing uuid parameter" }, { status: 400 });
    }

    const res = await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.uploadcare-v0.7+json",
        Authorization: `Uploadcare.Simple ${PUBLIC_KEY}:${SECRET_KEY}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "Failed to delete file from Uploadcare", details: errText },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, uuid });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error deleting Uploadcare file", details: error.message },
      { status: 500 }
    );
  }
}

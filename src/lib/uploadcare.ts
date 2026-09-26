import { uploadFile, UploadcareFile } from "@uploadcare/upload-client";
import { getPrefixedCdnBaseSync } from "@uploadcare/cname-prefix";

export const UPLOADCARE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "ccaefc44640da9c67ac4";

/**
 * Computes the official modern project delivery subdomain dynamically (e.g. https://55ztmt7g47.ucarecd.net)
 */
export function getUploadcareCdnBase(): string {
  if (process.env.NEXT_PUBLIC_UPLOADCARE_CDN_BASE) {
    return process.env.NEXT_PUBLIC_UPLOADCARE_CDN_BASE;
  }
  try {
    if (UPLOADCARE_PUBLIC_KEY) {
      return getPrefixedCdnBaseSync(UPLOADCARE_PUBLIC_KEY, "https://ucarecd.net");
    }
  } catch {}
  return "https://ucarecdn.com";
}

export const UPLOADCARE_CDN_BASE = getUploadcareCdnBase();

export interface UploadedAudioTrack {
  uuid: string;
  cdnUrl: string;
  streamUrl: string;
  name: string;
  size: number;
}

/**
 * Upload an audio file/blob directly to Uploadcare Smart CDN via upload client.
 * Returns the track metadata and streaming CDN URL.
 */
export async function uploadAudioToUploadcare(
  file: File | Blob,
  fileName?: string
): Promise<UploadedAudioTrack> {
  const publicKey = UPLOADCARE_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error(
      "Uploadcare Public Key is missing. Please set NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY in .env.local"
    );
  }

  const name = fileName || (file instanceof File ? file.name : "audio_track.mp3");

  const result: UploadcareFile = await uploadFile(file, {
    publicKey,
    store: "auto",
    fileName: name,
    integration: "llm-nextjs",
  });

  const baseCdn = result.cdnUrl || `${getUploadcareCdnBase()}/${result.uuid}/`;
  const streamUrl = `${baseCdn}${encodeURIComponent(name)}`;

  return {
    uuid: result.uuid,
    cdnUrl: baseCdn,
    streamUrl,
    name,
    size: result.size,
  };
}

/**
 * Deliver optimized audio stream from Uploadcare CDN with byte-range scrubbing.
 */
export function getAudioStreamUrl(uuid: string, filename?: string): string {
  const base = `${getUploadcareCdnBase()}/${uuid}/`;
  return filename ? `${base}${encodeURIComponent(filename)}` : base;
}

/**
 * Deliver optimized image with on-the-fly transformations from Uploadcare CDN.
 * Example: https://<cdn-domain>/<uuid>/-/preview/1000x1000/
 */
export function getOptimizedImageUrl(
  uuid: string,
  options: { width?: number; height?: number } = {}
): string {
  const w = options.width || 1000;
  const h = options.height || 1000;
  return `${getUploadcareCdnBase()}/${uuid}/-/preview/${w}x${h}/`;
}

/**
 * Deliver adaptive bitrate video for streaming from Uploadcare CDN.
 * Example: https://<cdn-domain>/<uuid>/adaptive_video/
 */
export function getAdaptiveVideoUrl(uuid: string): string {
  return `${getUploadcareCdnBase()}/${uuid}/adaptive_video/`;
}

import { buildAssetUrl, inferModelFormat } from "@/lib/backend";
import type { AssetRecord, CreationRecord, GiftObject, PublicShareRecord } from "@/types/database";

const DEFAULT_POSITION: [number, number, number] = [0, 0.5, 0];
const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0];
const DEFAULT_SCALE: [number, number, number] = [1, 1, 1];

function assetToSceneObject(asset: AssetRecord, title: string, prompt?: string): GiftObject | null {
  const url = buildAssetUrl(asset);
  if (!url) {
    return null;
  }

  return {
    id: asset.id,
    name: title,
    url,
    format: inferModelFormat(asset),
    position: DEFAULT_POSITION,
    rotation: DEFAULT_ROTATION,
    scale: DEFAULT_SCALE,
    prompt,
    assetId: asset.id,
    mimeType: asset.mime_type,
  };
}

export function creationToSceneObjects(creation: CreationRecord): GiftObject[] {
  return creation.assets
    .map((asset) => assetToSceneObject(asset, creation.title, creation.final_prompt))
    .filter((asset): asset is GiftObject => Boolean(asset));
}

export function publicShareToSceneObjects(share: PublicShareRecord): GiftObject[] {
  return share.assets
    .map((asset) => assetToSceneObject(asset, share.title, share.prompt))
    .filter((asset): asset is GiftObject => Boolean(asset));
}

export function deriveGiftTitle(prompt: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, " ");
  if (!cleaned) {
    return "Untitled Gift";
  }
  return cleaned.length > 48 ? `${cleaned.slice(0, 45)}...` : cleaned;
}

export function extractShareSlug(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.at(-1) || "";
  } catch {
    return trimmed.replace(/^\/+|\/+$/g, "").split("/").at(-1) || "";
  }
}

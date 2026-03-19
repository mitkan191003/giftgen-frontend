export type Vector3Tuple = [number, number, number];

export interface AppUser {
  id: string;
  email: string;
  displayName?: string | null;
  authProvider: "development" | "cognito";
}

export interface AuthSession {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AssetRecord {
  id: string;
  asset_type: string;
  storage_bucket: string;
  storage_key: string;
  mime_type: string;
  file_size: number;
  download_url?: string | null;
  created_at: string;
}

export interface CreationRecord {
  id: string;
  title: string;
  final_prompt: string;
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string | null;
  assets: AssetRecord[];
}

export interface GenerationJobRecord {
  id: string;
  provider: string;
  provider_job_id: string | null;
  model_name: string;
  input_payload: Record<string, unknown>;
  status: string;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface CreationEnvelope {
  creation: CreationRecord;
  job: GenerationJobRecord;
}

export interface ShareRecord {
  id: string;
  creation_id: string;
  share_type: string;
  share_slug: string;
  is_active: boolean;
  created_at: string;
  revoked_at: string | null;
  public_url: string;
}

export interface PublicShareRecord {
  title: string;
  prompt: string;
  visibility: string;
  share_type: string;
  owner_display_name: string | null;
  assets: AssetRecord[];
}

export interface GiftObject {
  id: string;
  name: string;
  url: string;
  format?: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
  prompt?: string;
  assetId?: string;
  mimeType?: string;
}

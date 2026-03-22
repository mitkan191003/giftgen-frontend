import type {
  AppUser,
  AssetRecord,
  AuthSession,
  CreationEnvelope,
  CreationRecord,
  GenerationJobRecord,
  MessageExchangeRecord,
  PublicShareRecord,
  ShareRecord,
  ThreadDetailRecord,
  ThreadRecord,
} from "@/types/database";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_API_URL ||
  "";

const API_PREFIX = "/api/v1";

export interface BackendAuthContext {
  user: AppUser | null;
  session: AuthSession | null;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: Record<string, unknown>;
  timeout?: number;
  auth?: BackendAuthContext;
}

function getBackendAuthMode(): "development" | "cognito" {
  return process.env.NEXT_PUBLIC_BACKEND_AUTH_MODE === "cognito" ? "cognito" : "development";
}

interface BackendErrorDetail {
  message?: string;
  reasons?: string[];
}

function buildHeaders(auth?: BackendAuthContext): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!auth?.user) {
    return headers;
  }

  if (getBackendAuthMode() === "cognito" && (auth.session?.idToken || auth.session?.accessToken)) {
    headers.Authorization = `Bearer ${auth.session?.idToken || auth.session?.accessToken}`;
    return headers;
  }

  headers["X-Dev-User-Email"] = auth.user.email;
  if (auth.user.displayName) {
    headers["X-Dev-Display-Name"] = auth.user.displayName;
  }
  return headers;
}

export async function backendFetch<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  const { method = "GET", body, timeout = 120000, auth } = options;

  if (!BACKEND_URL) {
    return { data: null, error: "Backend not configured", status: 503 };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method,
      headers: buildHeaders(auth),
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      try {
        const parsed = JSON.parse(text) as { detail?: string | BackendErrorDetail };
        if (typeof parsed.detail === "string") {
          return { data: null, error: parsed.detail, status: response.status };
        }
        if (parsed.detail && typeof parsed.detail === "object" && parsed.detail.message) {
          const reasons =
            Array.isArray(parsed.detail.reasons) && parsed.detail.reasons.length > 0
              ? ` (${parsed.detail.reasons.join(", ")})`
              : "";
          return { data: null, error: `${parsed.detail.message}${reasons}`, status: response.status };
        }
      } catch {
        // ignore
      }
      return { data: null, error: text || "Request failed", status: response.status };
    }

    if (response.status === 204) {
      return { data: null, error: null, status: response.status };
    }

    return {
      data: (await response.json()) as T,
      error: null,
      status: response.status,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      return { data: null, error: "Request timed out", status: 504 };
    }
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    };
  }
}

export function isBackendConfigured(): boolean {
  return Boolean(BACKEND_URL);
}

export function getBackendUrl(): string {
  return BACKEND_URL;
}

export function buildAssetUrl(asset: AssetRecord): string | null {
  if (!asset.download_url) {
    return null;
  }
  if (asset.download_url.startsWith("http://") || asset.download_url.startsWith("https://")) {
    return asset.download_url;
  }
  if (!BACKEND_URL) {
    return null;
  }
  return `${BACKEND_URL}${asset.download_url}`;
}

export function inferModelFormat(asset: AssetRecord): string {
  const key = asset.storage_key.toLowerCase();
  if (asset.mime_type === "model/gltf-binary" || key.endsWith(".glb")) return "glb";
  if (key.endsWith(".gltf")) return "gltf";
  if (key.endsWith(".ply")) return "ply";
  if (key.endsWith(".obj")) return "obj";
  return "glb";
}

export async function createCreation(
  prompt: string,
  title: string,
  auth: BackendAuthContext,
  options?: {
    sourceThreadId?: string;
    visibility?: "private" | "unlisted" | "public";
  }
): Promise<CreationEnvelope> {
  const { data, error, status } = await backendFetch<CreationEnvelope>(`${API_PREFIX}/creations`, {
    method: "POST",
    auth,
    body: {
      title,
      prompt,
      source_thread_id: options?.sourceThreadId,
      visibility: options?.visibility ?? "private",
    },
    timeout: 30000,
  });

  if (!data) {
    throw new Error(error || `Failed to create creation (${status})`);
  }

  return data;
}

export async function getJob(jobId: string, auth: BackendAuthContext): Promise<GenerationJobRecord> {
  const { data, error, status } = await backendFetch<GenerationJobRecord>(`${API_PREFIX}/jobs/${jobId}`, {
    method: "GET",
    auth,
    timeout: 30000,
  });

  if (!data) {
    throw new Error(error || `Failed to fetch job (${status})`);
  }

  return data;
}

export async function listCreations(auth: BackendAuthContext): Promise<CreationRecord[]> {
  const { data, error, status } = await backendFetch<CreationRecord[]>(`${API_PREFIX}/creations`, {
    method: "GET",
    auth,
    timeout: 30000,
  });

  if (!data) {
    throw new Error(error || `Failed to fetch creations (${status})`);
  }

  return data;
}

export async function createThread(
  title: string | null,
  auth: BackendAuthContext
): Promise<ThreadRecord> {
  const { data, error, status } = await backendFetch<ThreadRecord>(`${API_PREFIX}/threads`, {
    method: "POST",
    auth,
    body: {
      title,
    },
    timeout: 30000,
  });

  if (!data) {
    throw new Error(error || `Failed to create thread (${status})`);
  }

  return data;
}

export async function listThreads(auth: BackendAuthContext): Promise<ThreadRecord[]> {
  const { data, error, status } = await backendFetch<ThreadRecord[]>(`${API_PREFIX}/threads`, {
    method: "GET",
    auth,
    timeout: 30000,
  });

  if (!data) {
    throw new Error(error || `Failed to fetch threads (${status})`);
  }

  return data;
}

export async function getThread(threadId: string, auth: BackendAuthContext): Promise<ThreadDetailRecord> {
  const { data, error, status } = await backendFetch<ThreadDetailRecord>(`${API_PREFIX}/threads/${threadId}`, {
    method: "GET",
    auth,
    timeout: 30000,
  });

  if (!data) {
    throw new Error(error || `Failed to fetch thread (${status})`);
  }

  return data;
}

export async function createThreadMessage(
  threadId: string,
  content: string,
  auth: BackendAuthContext
): Promise<MessageExchangeRecord> {
  const { data, error, status } = await backendFetch<MessageExchangeRecord>(
    `${API_PREFIX}/threads/${threadId}/messages`,
    {
      method: "POST",
      auth,
      body: { content },
      timeout: 30000,
    }
  );

  if (!data) {
    throw new Error(error || `Failed to create thread message (${status})`);
  }

  return data;
}

export async function waitForCreationReady(
  creationId: string,
  jobId: string,
  auth: BackendAuthContext,
  onProgress?: (value: number) => void
): Promise<CreationRecord> {
  let progress = 10;
  onProgress?.(progress);

  while (true) {
    const job = await getJob(jobId, auth);
    if (job.status === "succeeded") {
      const creations = await listCreations(auth);
      const creation = creations.find((item) => item.id === creationId);
      if (!creation) {
        throw new Error("Creation completed but could not be loaded");
      }
      onProgress?.(100);
      return creation;
    }

    if (job.status === "failed" || job.status === "expired") {
      throw new Error(job.error_message || "Generation failed");
    }

    progress = Math.min(progress + 8, 92);
    onProgress?.(progress);
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
}

export async function createShare(
  creationId: string,
  shareType: "unlisted" | "public",
  auth: BackendAuthContext
): Promise<ShareRecord> {
  const { data, error, status } = await backendFetch<ShareRecord>(`${API_PREFIX}/shares`, {
    method: "POST",
    auth,
    body: {
      creation_id: creationId,
      share_type: shareType,
    },
    timeout: 30000,
  });

  if (!data) {
    throw new Error(error || `Failed to create share (${status})`);
  }

  return data;
}

export async function getPublicShare(slug: string): Promise<PublicShareRecord> {
  const { data, error, status } = await backendFetch<PublicShareRecord>(`${API_PREFIX}/public/shares/${slug}`, {
    method: "GET",
    timeout: 30000,
  });

  if (!data) {
    throw new Error(error || `Failed to load public share (${status})`);
  }

  return data;
}

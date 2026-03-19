"use client";

import type { AppUser, AuthSession } from "@/types/database";

const AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_MODE === "development" ? "development" : "cognito";
const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "";
const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "";
const COGNITO_REDIRECT_URI =
  process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI || "http://localhost:3000/auth/callback";
const COGNITO_LOGOUT_URI = process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI || "http://localhost:3000";
const PKCE_KEY = "giftgen.pkce_verifier";

function base64UrlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function randomString(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues, (value) => charset[value % charset.length]).join("");
}

async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

export function isCognitoConfigured(): boolean {
  return AUTH_MODE === "cognito" && Boolean(COGNITO_DOMAIN && COGNITO_CLIENT_ID && COGNITO_REDIRECT_URI);
}

export function isDevelopmentAuthMode(): boolean {
  return !isCognitoConfigured();
}

export async function beginCognitoLogin(): Promise<void> {
  if (!isCognitoConfigured()) {
    throw new Error("Cognito is not configured");
  }

  const verifier = randomString(96);
  const challenge = await pkceChallenge(verifier);
  sessionStorage.setItem(PKCE_KEY, verifier);

  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: COGNITO_REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  window.location.assign(`${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`);
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

function parseJwt(token: string): Record<string, unknown> {
  const [, payload = ""] = token.split(".");
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return JSON.parse(atob(padded)) as Record<string, unknown>;
}

export async function exchangeCodeForSession(code: string): Promise<{ user: AppUser; session: AuthSession }> {
  const verifier = sessionStorage.getItem(PKCE_KEY);
  if (!verifier) {
    throw new Error("Missing PKCE verifier");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: COGNITO_CLIENT_ID,
    code,
    redirect_uri: COGNITO_REDIRECT_URI,
    code_verifier: verifier,
  });

  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to exchange auth code");
  }

  const tokens = (await response.json()) as TokenResponse;
  sessionStorage.removeItem(PKCE_KEY);

  const idPayload = parseJwt(tokens.id_token);
  const displayName =
    (typeof idPayload.name === "string" && idPayload.name) ||
    (typeof idPayload.email === "string" && idPayload.email.split("@")[0]) ||
    null;

  const user: AppUser = {
    id: String(idPayload.sub || idPayload["cognito:username"] || idPayload.email || "cognito-user"),
    email: String(idPayload.email || "unknown@example.com"),
    displayName,
    authProvider: "cognito",
  };

  const session: AuthSession = {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
  };

  return { user, session };
}

export function createDevelopmentUser(email: string): AppUser {
  const normalized = email.trim().toLowerCase();
  return {
    id: `dev-${normalized}`,
    email: normalized,
    displayName: normalized.split("@")[0],
    authProvider: "development",
  };
}

export function buildLogoutUrl(): string | null {
  if (!isCognitoConfigured()) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    logout_uri: COGNITO_LOGOUT_URI,
  });
  return `${COGNITO_DOMAIN}/logout?${params.toString()}`;
}

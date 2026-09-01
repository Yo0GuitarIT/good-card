import type { AdminCollectionResponse, CardData } from "@good-card/shared";

export class UnauthorizedError extends Error {
  constructor() {
    super("unauthorized");
    this.name = "UnauthorizedError";
  }
}

/** 授印或撤回被拒絕，code 例如 card_locked、card_already_complete、no_stamps_to_revoke。 */
export class StampActionError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.name = "StampActionError";
    this.code = code;
  }
}

const jsonHeaders = { "content-type": "application/json" };

async function readErrorCode(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `http_${response.status}`;
  } catch {
    return `http_${response.status}`;
  }
}

/** 目前的 cookie 是否還是有效的授印者身分。 */
export async function checkSession(): Promise<boolean> {
  const response = await fetch("/api/admin/me", {
    credentials: "same-origin",
  });
  return response.ok;
}

export async function login(password: string): Promise<void> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: jsonHeaders,
    credentials: "same-origin",
    body: JSON.stringify({ password }),
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error(await readErrorCode(response));
  }
}

export async function logout(): Promise<void> {
  await fetch("/api/admin/logout", {
    method: "POST",
    credentials: "same-origin",
  });
}

export async function fetchAdminCollection(): Promise<AdminCollectionResponse> {
  const response = await fetch("/api/admin/collection", {
    credentials: "same-origin",
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new Error(await readErrorCode(response));
  }

  return (await response.json()) as AdminCollectionResponse;
}

export async function awardStamp(cardId: string): Promise<CardData> {
  const response = await fetch(
    `/api/admin/cards/${encodeURIComponent(cardId)}/stamps`,
    { method: "POST", credentials: "same-origin" },
  );

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new StampActionError(await readErrorCode(response));
  }

  return (await response.json()) as CardData;
}

export async function revokeLastStamp(cardId: string): Promise<CardData> {
  const response = await fetch(
    `/api/admin/cards/${encodeURIComponent(cardId)}/stamps/last`,
    { method: "DELETE", credentials: "same-origin" },
  );

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    throw new StampActionError(await readErrorCode(response));
  }

  return (await response.json()) as CardData;
}

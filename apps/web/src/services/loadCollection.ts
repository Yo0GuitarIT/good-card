import type { CollectionResponse } from "@good-card/shared";

/** 查看連結無效或已被重新產生。 */
export class CollectionNotFoundError extends Error {
  constructor() {
    super("collection_not_found");
    this.name = "CollectionNotFoundError";
  }
}

export async function loadCollection(
  token: string,
  signal?: AbortSignal,
): Promise<CollectionResponse> {
  const response = await fetch(
    `/api/collections/${encodeURIComponent(token)}`,
    { headers: { accept: "application/json" }, signal },
  );

  if (response.status === 404) {
    throw new CollectionNotFoundError();
  }

  if (!response.ok) {
    throw new Error(`集印帳の取得に失敗しました（${response.status}）`);
  }

  return (await response.json()) as CollectionResponse;
}

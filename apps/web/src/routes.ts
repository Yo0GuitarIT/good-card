const TOKEN_STORAGE_KEY = "good-card:view-token";

/** 從 /card/:token 取出 token；其他路徑回傳 null。 */
export function readTokenFromPath(pathname: string): string | null {
  const match = /^\/card\/([^/]+)\/?$/.exec(pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

export function rememberToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // 無法寫入時只影響下次從主畫面圖示開啟，不影響本次瀏覽。
  }
}

export function forgetToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // 忽略：清不掉也只是留下一個失效的 token。
  }
}

function recallToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * 網址優先，其次是上次成功開啟過的 token。
 * manifest 的 start_url 是 "/"，從主畫面圖示開啟時網址不會帶 token，
 * 靠記住的 token 才能直接開到集印帳。
 */
export function resolveViewToken(pathname: string): string | null {
  return readTokenFromPath(pathname) ?? recallToken();
}

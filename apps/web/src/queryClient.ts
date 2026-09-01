import { QueryClient } from "@tanstack/react-query";
import { CollectionNotFoundError } from "./services/loadCollection";
import { UnauthorizedError } from "./services/admin";

/** 連結失效與未登入重試幾次都不會變，重試只是拖慢畫面。 */
function shouldRetry(failureCount: number, error: Error): boolean {
  if (
    error instanceof CollectionNotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return false;
  }
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      // 目前先不做自動同步：Card 的落印動畫只在掛載時判斷新章，
      // 資料在原地更新不會播動畫。等 Card 能處理章數變化再打開。
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

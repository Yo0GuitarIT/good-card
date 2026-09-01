import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Card from "../components/Card";
import {
  StampActionError,
  UnauthorizedError,
  awardStamp,
  checkSession,
  fetchAdminCollection,
  login,
  logout,
  revokeLastStamp,
} from "../services/admin";

const sessionKey = ["admin", "session"];
const collectionKey = ["admin", "collection"];

function describeStampError(error: Error): string {
  if (error instanceof StampActionError) {
    if (error.code === "card_locked") {
      return "這張卡已經鎖定，無法變更。";
    }
    if (error.code === "card_already_complete") {
      return "已經蓋滿十枚，請先建立下一張卡。";
    }
    if (error.code === "no_stamps_to_revoke") {
      return "目前沒有可以撤回的章。";
    }
  }
  return "操作失敗，請再試一次。";
}

function AdminPage() {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [hasCopied, setHasCopied] = useState(false);
  const [isConfirmingRevoke, setIsConfirmingRevoke] = useState(false);

  const sessionQuery = useQuery({
    queryKey: sessionKey,
    queryFn: checkSession,
    staleTime: Infinity,
  });

  const isSignedIn = sessionQuery.data === true;

  const collectionQuery = useQuery({
    queryKey: collectionKey,
    queryFn: fetchAdminCollection,
    enabled: isSignedIn,
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      setPassword("");
      queryClient.setQueryData(sessionKey, true);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(sessionKey, false);
      queryClient.removeQueries({ queryKey: collectionKey });
    },
  });

  const awardMutation = useMutation({
    mutationFn: awardStamp,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: collectionKey }),
  });

  const revokeMutation = useMutation({
    mutationFn: revokeLastStamp,
    onSuccess: () => {
      setIsConfirmingRevoke(false);
      return queryClient.invalidateQueries({ queryKey: collectionKey });
    },
  });

  const handleCopy = async (viewUrl: string) => {
    try {
      await navigator.clipboard.writeText(viewUrl);
      setHasCopied(true);
      window.setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // 剪貼簿被拒絕時，連結本身仍顯示在畫面上可以手動複製。
    }
  };

  // cookie 過期時集印帳會拿到 401，退回登入畫面。
  const isSessionExpired = collectionQuery.error instanceof UnauthorizedError;

  if (sessionQuery.isPending) {
    return (
      <main className="admin">
        <p className="admin-hint">確認登入狀態…</p>
      </main>
    );
  }

  if (!isSignedIn || isSessionExpired) {
    return (
      <main className="admin">
        <header className="admin-header">
          <span className="admin-seal" aria-hidden="true">
            印
          </span>
          <h1>授印管理</h1>
        </header>

        <form
          className="admin-login"
          onSubmit={(event) => {
            event.preventDefault();
            loginMutation.mutate(password);
          }}
        >
          <label htmlFor="admin-password">密碼</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loginMutation.isPending}
          />
          <button type="submit" disabled={loginMutation.isPending || !password}>
            {loginMutation.isPending ? "驗證中…" : "登入"}
          </button>
          {loginMutation.error && (
            <p className="admin-alert" role="alert">
              {loginMutation.error instanceof UnauthorizedError
                ? "密碼錯誤。"
                : "無法連線到伺服器。"}
            </p>
          )}
          {isSessionExpired && (
            <p className="admin-alert" role="alert">
              登入已過期，請重新登入。
            </p>
          )}
        </form>
      </main>
    );
  }

  if (collectionQuery.isPending) {
    return (
      <main className="admin">
        <p className="admin-hint">載入中…</p>
      </main>
    );
  }

  if (collectionQuery.error) {
    return (
      <main className="admin">
        <p className="admin-alert" role="alert">
          無法載入集印帳。
        </p>
        <button
          type="button"
          className="admin-secondary"
          onClick={() => void collectionQuery.refetch()}
        >
          重新載入
        </button>
      </main>
    );
  }

  const { currentCard, viewToken, historyCards } = collectionQuery.data;
  const viewUrl = `${window.location.origin}/card/${viewToken}`;
  const stampCount = currentCard?.stamps.length ?? 0;
  const isComplete =
    currentCard !== null && stampCount >= currentCard.totalStamps;

  return (
    <main className="admin">
      <header className="admin-header">
        <span className="admin-seal" aria-hidden="true">
          印
        </span>
        <h1>授印管理</h1>
      </header>

      {currentCard ? (
        <>
          <div className="admin-card">
            <Card data={currentCard} />
          </div>

          <section className="admin-panel">
            <p className="admin-progress">
              <span>{stampCount}</span>
              <span aria-hidden="true">/</span>
              <span>{currentCard.totalStamps}</span>
            </p>

            <button
              type="button"
              className="admin-award"
              onClick={() => awardMutation.mutate(currentCard.id)}
              disabled={
                awardMutation.isPending || revokeMutation.isPending || isComplete
              }
            >
              {awardMutation.isPending
                ? "授印中…"
                : isComplete
                  ? "已滿願"
                  : "授印一枚"}
            </button>

            {isConfirmingRevoke ? (
              <div className="admin-confirm">
                <p>
                  要撤回最後一枚章嗎？
                  <br />
                  撤回後無法復原。
                </p>
                <div className="admin-confirm-actions">
                  <button
                    type="button"
                    className="admin-secondary admin-danger"
                    onClick={() => revokeMutation.mutate(currentCard.id)}
                    disabled={revokeMutation.isPending}
                  >
                    {revokeMutation.isPending ? "撤回中…" : "確定撤回"}
                  </button>
                  <button
                    type="button"
                    className="admin-secondary"
                    onClick={() => setIsConfirmingRevoke(false)}
                    disabled={revokeMutation.isPending}
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="admin-secondary admin-danger"
                onClick={() => setIsConfirmingRevoke(true)}
                disabled={awardMutation.isPending || stampCount === 0}
              >
                撤回最後一枚
              </button>
            )}

            {(awardMutation.error || revokeMutation.error) && (
              <p className="admin-alert" role="alert">
                {describeStampError(
                  (awardMutation.error ?? revokeMutation.error)!,
                )}
              </p>
            )}
          </section>
        </>
      ) : (
        <p className="admin-hint">
          目前沒有進行中的卡片，請建立下一張。
        </p>
      )}

      <section className="admin-meta">
        <h2>查看連結</h2>
        <code className="admin-link">{viewUrl}</code>
        <button
          type="button"
          className="admin-secondary"
          onClick={() => void handleCopy(viewUrl)}
        >
          {hasCopied ? "已複製" : "複製連結"}
        </button>
        {historyCards.length > 0 && (
          <p className="admin-hint">已完成的卡片：{historyCards.length} 張</p>
        )}
        <button
          type="button"
          className="admin-secondary admin-logout"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          登出
        </button>
      </section>
    </main>
  );
}

export default AdminPage;

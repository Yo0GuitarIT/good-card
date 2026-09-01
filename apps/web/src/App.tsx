import { useEffect, useState } from "react";
import "./App.css";
import Card from "./components/Card";
import CardError from "./components/CardError";
import CardLoading from "./components/CardLoading";
import {
  CollectionNotFoundError,
  loadCollection,
} from "./services/loadCollection";
import { forgetToken, rememberToken, resolveViewToken } from "./routes";
import type { CardData } from "@good-card/shared";

type CardLoadState =
  | { status: "loading" }
  | { status: "ready"; data: CardData }
  | { status: "no-token" }
  | { status: "invalid-link" }
  | { status: "no-active-card" }
  | { status: "error" };

function App() {
  // token 在整個瀏覽期間不變，同步算出來即可，不需要放進 effect。
  const [token] = useState(() => resolveViewToken(window.location.pathname));
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [cardState, setCardState] = useState<CardLoadState>(() =>
    token ? { status: "loading" } : { status: "no-token" },
  );

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    loadCollection(token, controller.signal)
      .then((collection) => {
        if (controller.signal.aborted) return;

        rememberToken(token);

        if (!collection.currentCard) {
          setCardState({ status: "no-active-card" });
          return;
        }

        setCardState({ status: "ready", data: collection.currentCard });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;

        if (error instanceof CollectionNotFoundError) {
          // 失效的 token 留著只會每次都失敗，直接忘掉。
          forgetToken();
          setCardState({ status: "invalid-link" });
          return;
        }

        setCardState({ status: "error" });
      });

    return () => {
      controller.abort();
    };
  }, [token, loadAttempt]);

  const handleRetry = () => {
    setCardState({ status: "loading" });
    setLoadAttempt((currentAttempt) => currentAttempt + 1);
  };

  return (
    <main className="App">
      {cardState.status === "loading" && <CardLoading />}
      {cardState.status === "error" && <CardError onRetry={handleRetry} />}
      {cardState.status === "no-token" && (
        <CardError
          title="集印帳のリンクが必要です"
          description="お手元の私的なリンクからお開きください。"
        />
      )}
      {cardState.status === "invalid-link" && (
        <CardError
          title="この集印帳は見つかりません"
          description="リンクが無効になっている可能性があります。"
        />
      )}
      {cardState.status === "no-active-card" && (
        <CardError
          title="進行中の集印帳はありません"
          description="次の集印帳が用意されるまで、しばらくお待ちください。"
        />
      )}
      {cardState.status === "ready" && <Card data={cardState.data} />}
    </main>
  );
}

export default App;

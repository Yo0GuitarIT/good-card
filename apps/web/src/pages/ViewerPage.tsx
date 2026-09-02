import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "../components/Card";
import CardError from "../components/CardError";
import CardLoading from "../components/CardLoading";
import {
  CollectionNotFoundError,
  loadCollection,
} from "../services/loadCollection";
import { forgetToken, rememberToken, resolveViewToken } from "../routes";

function ViewerPage() {
  // token 在整個瀏覽期間不變，同步算出來即可。
  const [token] = useState(() => resolveViewToken(window.location.pathname));

  const collectionQuery = useQuery({
    queryKey: ["collection", token],
    enabled: token !== null,
    queryFn: async ({ signal }) => {
      if (!token) throw new Error("missing_token");

      try {
        const collection = await loadCollection(token, signal);
        rememberToken(token);
        return collection;
      } catch (error) {
        if (error instanceof CollectionNotFoundError) {
          // 失效的 token 留著只會每次都失敗，直接忘掉。
          forgetToken();
        }
        throw error;
      }
    },
  });

  if (!token) {
    return (
      <main className="App">
        <CardError
          title="集印帳のリンクが必要です"
          description="お手元の私的なリンクからお開きください。"
        />
      </main>
    );
  }

  if (collectionQuery.isPending) {
    return (
      <main className="App">
        <CardLoading />
      </main>
    );
  }

  if (collectionQuery.error) {
    if (collectionQuery.error instanceof CollectionNotFoundError) {
      return (
        <main className="App">
          <CardError
            title="この集印帳は見つかりません"
            description="リンクが無効になっている可能性があります。"
          />
        </main>
      );
    }

    return (
      <main className="App">
        <CardError onRetry={() => void collectionQuery.refetch()} />
      </main>
    );
  }

  const currentCard = collectionQuery.data.currentCard;

  if (!currentCard) {
    return (
      <main className="App">
        <CardError
          title="進行中の集印帳はありません"
          description="次の集印帳が用意されるまで、しばらくお待ちください。"
        />
      </main>
    );
  }

  return (
    <main className="App">
      <Card data={currentCard} />
    </main>
  );
}

export default ViewerPage;

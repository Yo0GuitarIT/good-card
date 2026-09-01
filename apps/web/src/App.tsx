import { useEffect, useState } from "react";
import "./App.css";
import Card from "./components/Card";
import CardError from "./components/CardError";
import CardLoading from "./components/CardLoading";
import { loadCard } from "./services/loadCard";
import type { CardData } from "@good-card/shared";

type CardLoadState =
  | { status: "loading" }
  | { status: "ready"; data: CardData }
  | { status: "error" };

function App() {
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [cardState, setCardState] = useState<CardLoadState>({
    status: "loading",
  });

  useEffect(() => {
    let isCancelled = false;

    loadCard()
      .then((data) => {
        if (!isCancelled) {
          setCardState({ status: "ready", data });
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setCardState({ status: "error" });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [loadAttempt]);

  const handleRetry = () => {
    setCardState({ status: "loading" });
    setLoadAttempt((currentAttempt) => currentAttempt + 1);
  };

  return (
    <main className="App">
      {cardState.status === "loading" && <CardLoading />}
      {cardState.status === "error" && <CardError onRetry={handleRetry} />}
      {cardState.status === "ready" && <Card data={cardState.data} />}
    </main>
  );
}

export default App;

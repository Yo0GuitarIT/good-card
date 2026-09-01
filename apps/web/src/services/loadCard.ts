import { cardData } from "../data/cards";
import type { CardData } from "@good-card/shared";

export function loadCard(): Promise<CardData> {
  return Promise.resolve(cardData);
}

import { cardData } from "../data/cards";
import type { CardData } from "../types/card";

export function loadCard(): Promise<CardData> {
  return Promise.resolve(cardData);
}

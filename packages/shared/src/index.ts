export type ThemeId = "black-gold";

export type StampData = {
  id: string;
  awardedAt: string;
};

export type CardData = {
  id: string;
  serialNumber: number;
  label: string;
  title: string;
  ownerName: string;
  issuerName: string;
  totalStamps: number;
  stamps: StampData[];
  themeId: ThemeId;
  createdAt: string;
  completedAt: string | null;
};

/** GET /api/collections/:token 的回應 */
export type CollectionResponse = {
  collectionId: string;
  currentCard: CardData | null;
  historyCards: CardData[];
};

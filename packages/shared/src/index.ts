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

/**
 * GET /api/admin/collection 的回應。
 * restorableStamp 是進行中卡片最近一枚被撤回、還在保留期限內的章。
 */
export type AdminCollectionResponse = CollectionResponse & {
  viewToken: string;
  restorableStamp: StampData | null;
};

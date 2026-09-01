import type { CardData } from "@good-card/shared";

type CardRow = {
  id: string;
  serialNumber: number;
  label: string;
  title: string;
  totalStamps: number;
  themeId: string;
  createdAt: Date;
  completedAt: Date | null;
};

type StampRow = {
  id: string;
  awardedAt: Date;
};

type CollectionRow = {
  ownerName: string;
  issuerName: string;
};

export function toCardData(
  card: CardRow,
  stamps: StampRow[],
  collection: CollectionRow,
): CardData {
  return {
    id: card.id,
    serialNumber: card.serialNumber,
    label: card.label,
    title: card.title,
    ownerName: collection.ownerName,
    issuerName: collection.issuerName,
    totalStamps: card.totalStamps,
    stamps: stamps.map((stamp) => ({
      id: stamp.id,
      awardedAt: stamp.awardedAt.toISOString(),
    })),
    themeId: card.themeId as CardData["themeId"],
    createdAt: card.createdAt.toISOString(),
    completedAt: card.completedAt?.toISOString() ?? null,
  };
}

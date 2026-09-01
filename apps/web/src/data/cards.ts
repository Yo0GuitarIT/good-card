import type { CardData } from "@good-card/shared";

export const cardData: CardData = {
  id: "card-001",
  serialNumber: 1,
  label: "御褒美",
  title: "集印帳",
  ownerName: "トモ",
  issuerName: "みずき",
  totalStamps: 10,
  stamps: [
    { id: "stamp-001", awardedAt: "2026-08-01T12:00:00+08:00" },
    { id: "stamp-002", awardedAt: "2026-08-03T18:30:00+08:00" },
    { id: "stamp-003", awardedAt: "2026-08-05T20:00:00+08:00" },
    { id: "stamp-004", awardedAt: "2026-08-18T22:32:00+08:00" },
    { id: "stamp-005", awardedAt: "2026-08-25T10:15:00+08:00" },
    { id: "stamp-006", awardedAt: "2026-08-25T23:10:00+08:00" },
    { id: "stamp-007", awardedAt: "2026-08-31T09:00:00+08:00" },
  ],
  themeId: "black-gold",
  createdAt: "2026-08-01T12:00:00+08:00",
  completedAt: null,
};

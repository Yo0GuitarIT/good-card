import type { CardData } from "../types/card";

export const cardData: CardData = {
  id: "card-001",
  serialNumber: 1,
  label: "御褒美",
  title: "集印帳",
  ownerName: "大切なひと",
  issuerName: "わたし",
  totalStamps: 10,
  stamps: [
    { id: "stamp-001", awardedAt: "2026-08-01T12:00:00+08:00" },
    { id: "stamp-002", awardedAt: "2026-08-03T18:30:00+08:00" },
    { id: "stamp-003", awardedAt: "2026-08-05T20:00:00+08:00" },
    { id: "stamp-004", awardedAt: "2026-08-07T19:15:00+08:00" },
    { id: "stamp-005", awardedAt: "2026-08-09T14:45:00+08:00" },
    { id: "stamp-006", awardedAt: "2026-08-12T21:10:00+08:00" },
    { id: "stamp-007", awardedAt: "2026-08-15T17:30:00+08:00" },
    { id: "stamp-008", awardedAt: "2026-08-18T16:20:00+08:00" },
    { id: "stamp-009", awardedAt: "2026-08-20T13:50:00+08:00" },
    { id: "stamp-010", awardedAt: "2026-08-22T11:20:00+08:00" }
  ],
  themeId: "black-gold",
  createdAt: "2026-08-01T12:00:00+08:00",
  completedAt: null,
};

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
  totalStamps: 10;
  stamps: StampData[];
  themeId: "black-gold";
  createdAt: string;
  completedAt: string | null;
};

import type { CardData } from "../types/card";
import { formatJapaneseNumber } from "../utils/formatJapaneseNumber";
import StampGrid from "./StampGrid";

type CardFrontProps = {
  data: CardData;
  newStampFromIndex: number | null;
  isCompleting: boolean;
};

function CardFront({ data, newStampFromIndex, isCompleting }: CardFrontProps) {
  const stampCount = data.stamps.length;
  const remainingStamps = Math.max(data.totalStamps - stampCount, 0);

  return (
    <article className="card-face card-front">
      <div className="card-shine" aria-hidden="true" />
      <span className="card-label">{data.label}</span>
      <h1>{data.title}</h1>
      <StampGrid
        stampCount={stampCount}
        totalStamps={data.totalStamps}
        newStampFromIndex={newStampFromIndex}
      />
      <p className="stamp-progress">
        {formatJapaneseNumber(stampCount)}印／
        {formatJapaneseNumber(data.totalStamps)}印
      </p>
      <p className="stamp-remaining">
        {remainingStamps === 0
          ? "満願成就"
          : `満願まで あと${formatJapaneseNumber(remainingStamps)}印`}
      </p>
      {isCompleting && (
        <div className="completion-celebration" aria-live="polite">
          <span>満願成就</span>
        </div>
      )}
    </article>
  );
}

export default CardFront;

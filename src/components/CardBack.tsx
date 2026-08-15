import type { CardData } from "../types/card";
import { formatJapaneseNumber } from "../utils/formatJapaneseNumber";

type CardBackProps = {
  data: CardData;
};

function CardBack({ data }: CardBackProps) {
  return (
    <article className="card-face card-back">
      <div className="card-shine" aria-hidden="true" />
      <span className="card-number">
        第{formatJapaneseNumber(data.serialNumber)}号
      </span>

      <div className="card-back-title">
        <span>{data.label}</span>
        <strong>{data.title}</strong>
      </div>

      <dl className="card-details">
        <div>
          <dt>持ち主</dt>
          <dd>{data.ownerName}</dd>
        </div>
        <div>
          <dt>授印者</dt>
          <dd>{data.issuerName}</dd>
        </div>
      </dl>

      <div
        className="completion-seal"
        aria-label={`${formatJapaneseNumber(data.totalStamps)}印満願`}
      >
        <span>{formatJapaneseNumber(data.totalStamps)}印</span>
        <span>満願</span>
      </div>
    </article>
  );
}

export default CardBack;

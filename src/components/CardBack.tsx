function CardBack() {
  return (
    <article className="card-face card-back">
      <div className="card-shine" aria-hidden="true" />
      <span className="card-number">第一号</span>

      <div className="card-back-title">
        <span>御褒美</span>
        <strong>集印帳</strong>
      </div>

      <dl className="card-details">
        <div>
          <dt>持ち主</dt>
          <dd>大切なひと</dd>
        </div>
        <div>
          <dt>授印者</dt>
          <dd>わたし</dd>
        </div>
      </dl>

      <div className="completion-seal" aria-label="十印満願">
        <span>十印</span>
        <span>満願</span>
      </div>

      <p className="card-reward">御褒美は満願の折に</p>
    </article>
  );
}

export default CardBack;

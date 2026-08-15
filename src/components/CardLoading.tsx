function CardLoading() {
  return (
    <section className="card-status" aria-label="集印帳を読み込んでいます">
      <div className="card-skeleton" aria-hidden="true">
        <div className="card-skeleton-title" />
        <div className="card-skeleton-grid">
          {Array.from({ length: 10 }, (_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>
      <p>集印帳を開いています</p>
    </section>
  );
}

export default CardLoading;

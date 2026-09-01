type CardErrorProps = {
  onRetry: () => void;
};

function CardError({ onRetry }: CardErrorProps) {
  return (
    <section className="card-error" role="alert">
      <span className="card-error-seal" aria-hidden="true">
        印
      </span>
      <h1>集印帳を開けませんでした</h1>
      <p>通信状態をご確認のうえ、もう一度お試しください。</p>
      <button type="button" onClick={onRetry}>
        もう一度読み込む
      </button>
    </section>
  );
}

export default CardError;

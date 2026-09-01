type CardErrorProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

function CardError({
  title = "集印帳を開けませんでした",
  description = "通信状態をご確認のうえ、もう一度お試しください。",
  onRetry,
}: CardErrorProps) {
  return (
    <section className="card-error" role="alert">
      <span className="card-error-seal" aria-hidden="true">
        印
      </span>
      <h1>{title}</h1>
      <p>{description}</p>
      {onRetry && (
        <button type="button" onClick={onRetry}>
          もう一度読み込む
        </button>
      )}
    </section>
  );
}

export default CardError;

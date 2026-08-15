import StampGrid from "./StampGrid";

function CardFront() {
  return (
    <article className="card-face card-front">
      <div className="card-shine" aria-hidden="true" />
      <span className="card-label">御褒美</span>
      <h1>集印帳</h1>
      <StampGrid stampCount={7} totalStamps={10} />
      <p className="stamp-progress">七印／十印</p>
      <p className="stamp-remaining">満願まで あと三印</p>
    </article>
  );
}

export default CardFront;

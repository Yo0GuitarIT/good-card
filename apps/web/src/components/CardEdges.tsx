const edgeDepths = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];

function CardEdges() {
  return (
    <div className="card-edges" aria-hidden="true">
      {edgeDepths.map((depth) => (
        <div
          key={depth}
          className="card-edge-layer"
          style={{ transform: `translateZ(${depth}px)` }}
        />
      ))}
    </div>
  );
}

export default CardEdges;

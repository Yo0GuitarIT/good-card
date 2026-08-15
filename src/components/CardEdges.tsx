const edgeNames = ["top", "right", "bottom", "left"] as const;

function CardEdges() {
  return (
    <div className="card-edges" aria-hidden="true">
      {edgeNames.map((edgeName) => (
        <div key={edgeName} className={`card-edge card-edge-${edgeName}`} />
      ))}
    </div>
  );
}

export default CardEdges;

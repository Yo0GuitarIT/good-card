import Stamp from "./Stamp";

type StampGridProps = {
  stampCount: number;
  totalStamps: number;
  newStampFromIndex: number | null;
};

function StampGrid({
  stampCount,
  totalStamps,
  newStampFromIndex,
}: StampGridProps) {
  return (
    <div className="stamp-grid" role="list" aria-label="集印の進捗">
      {Array.from({ length: totalStamps }, (_, index) => (
        <Stamp
          key={index}
          index={index}
          collected={index < stampCount}
          isNew={
            newStampFromIndex !== null &&
            index >= newStampFromIndex &&
            index < stampCount
          }
          animationOrder={
            newStampFromIndex === null ? 0 : index - newStampFromIndex
          }
        />
      ))}
    </div>
  );
}

export default StampGrid;

import Stamp from "./Stamp";

type StampGridProps = {
  stampCount: number;
  totalStamps: number;
};

function StampGrid({ stampCount, totalStamps }: StampGridProps) {
  return (
    <div className="stamp-grid" role="list" aria-label="集印の進捗">
      {Array.from({ length: totalStamps }, (_, index) => (
        <Stamp key={index} index={index} collected={index < stampCount} />
      ))}
    </div>
  );
}

export default StampGrid;

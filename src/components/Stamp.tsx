type StampProps = {
  index: number;
  collected: boolean;
};

function Stamp({ index, collected }: StampProps) {
  return (
    <div
      className={`stamp ${collected ? "stamp-collected" : "stamp-empty"}`}
      role="listitem"
      aria-label={`${index + 1}印目：${collected ? "授印済み" : "未授印"}`}
    >
      <span aria-hidden="true">{collected ? "💮" : null}</span>
    </div>
  );
}

export default Stamp;

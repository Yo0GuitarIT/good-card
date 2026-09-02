import type { CSSProperties } from "react";

type StampProps = {
  index: number;
  collected: boolean;
  isNew: boolean;
  animationOrder: number;
};

type StampStyle = CSSProperties & {
  "--stamp-delay": string;
};

function Stamp({ index, collected, isNew, animationOrder }: StampProps) {
  const style: StampStyle | undefined = isNew
    ? { "--stamp-delay": `${1900 + animationOrder * 180}ms` }
    : undefined;

  return (
    <div
      className={`stamp ${collected ? "stamp-collected" : "stamp-empty"} ${isNew ? "stamp-new" : ""}`}
      role="listitem"
      aria-label={`${index + 1}印目：${collected ? "授印済み" : "未授印"}`}
      style={style}
    >
      <span aria-hidden="true">{collected ? "💮" : null}</span>
    </div>
  );
}

export default Stamp;

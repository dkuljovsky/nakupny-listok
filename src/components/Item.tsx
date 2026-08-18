import { useEffect, useState } from "react";
import type { Item } from "../hooks/useItems";
import useSwipeToDelete from "../hooks/useSwipeToDelete";

const relativeTimeFormat = new Intl.RelativeTimeFormat("sk-SK", {
  style: "short",
});

const RELATIVE_UNITS = [
  { unit: "year", seconds: 31536000 },
  { unit: "month", seconds: 2592000 },
  { unit: "day", seconds: 86400 },
  { unit: "hour", seconds: 3600 },
  { unit: "minute", seconds: 60 },
] as const;

type Props = {
  item: Item;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function Item({ item, onToggle, onDelete }: Props) {
  const [now, setNow] = useState(() => Date.now());
  const {
    dragX,
    dragging,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    wasJustSwiped,
  } = useSwipeToDelete(onDelete, item.id);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  function parseRelativeTime(time: string) {
    if (!time) return "";

    const diffSec = Math.round((new Date(time).getTime() - now) / 1000);

    const unit =
      RELATIVE_UNITS.find((u) => Math.abs(diffSec) >= u.seconds) ??
      ({ unit: "second", seconds: 1 } as const);

    return relativeTimeFormat.format(
      Math.round(diffSec / unit.seconds),
      unit.unit,
    );
  }

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onDelete(item.id);
  }

  function handleClick() {
    if (wasJustSwiped()) return;
    onToggle(item.id);
  }

  return (
    <div className={dragging ? "swipe-item dragging" : "swipe-item"}>
      <button className="swipe-delete" onClick={handleDelete}>
        Odstrániť
      </button>
      <div
        className="list-item"
        style={{ transform: `translateX(${dragX}px)` }}
        onClick={handleClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <h3>{item.text}</h3>
        <div className="list-item-meta">
          <span className="user">{item?.expand?.user?.name}</span>,{" "}
          {parseRelativeTime(item?.created)}
        </div>
        <button className="list-item-delete" onClick={handleDelete}>
          Odstrániť
        </button>
      </div>
    </div>
  );
}

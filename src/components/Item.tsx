import { useRef, useState } from "react";
import type { Item } from "../hooks/useItems";

const timeFormat = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "short",
  timeStyle: "short",
});

const MAX_DRAG = -120;
const DELETE_THRESHOLD = -80;

type Props = {
  item: Item;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function Item({ item, onToggle, onDelete }: Props) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragXRef = useRef(0);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);
  const justSwipedRef = useRef(false);

  function parseTime(time: string) {
    if (!time) return "";

    return timeFormat.format(new Date(time));
  }

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onDelete(item.id);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    draggingRef.current = true;
    justSwipedRef.current = false;
    startXRef.current = e.touches[0].clientX;
    setDragging(true);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;

    const delta = e.touches[0].clientX - startXRef.current;

    if (delta < 0) {
      const next = Math.max(delta, MAX_DRAG);
      dragXRef.current = next;
      setDragX(next);
    }
  }

  function handleTouchEnd() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);

    if (dragXRef.current < DELETE_THRESHOLD) {
      justSwipedRef.current = true;
      onDelete(item.id);
    } else {
      dragXRef.current = 0;
      setDragX(0);
    }
  }

  function handleClick() {
    if (justSwipedRef.current) {
      justSwipedRef.current = false;
      return;
    }
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
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <h3>{item.text}</h3>
        <span className="user">
          pridal {item?.expand?.user?.name} o {parseTime(item?.created)}
        </span>
        <button className="list-item-delete" onClick={handleDelete}>
          Odstrániť
        </button>
      </div>
    </div>
  );
}
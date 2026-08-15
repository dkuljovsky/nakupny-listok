import type { Item } from "../hooks/useItems";

const timeFormat = new Intl.DateTimeFormat("sk-SK", {
  dateStyle: "short",
  timeStyle: "short",
});

type Props = {
  item: Item;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function Item({ item, onToggle, onDelete }: Props) {
  function parseTime(time: string) {
    if (!time) return "";

    return timeFormat.format(new Date(time));
  }

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onDelete(item.id);
  }

  return (
    <div className="list-item" onClick={() => onToggle(item.id)}>
      <h3>{item.text}</h3>
      <span className="user">
        pridal {item?.expand?.user?.name} o {parseTime(item?.created)}
      </span>
      <button onClick={handleDelete}>Odstrániť</button>
    </div>
  );
}

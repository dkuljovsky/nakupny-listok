import Item from "../components/Item";
import ItemForm from "../components/ItemForm";
import { useAuthStore } from "../stores/auth";
import useItems from "../hooks/useItems";

export default function Dashboard() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { items, itemsStatus, addItem, updateItem, addItemStatus, deleteItem } =
    useItems();

  function handleAdd(text: string) {
    if (!user) return;
    addItem({ text, bought: false, user: user.id });
  }

  function toggleItem(id: string) {
    const item = items?.find((item) => item.id === id);
    if (item) updateItem({ id, bought: !item.bought });
  }

  const boughtItems = (items ?? []).filter((item) => item.bought);

  const remainingItems = (items ?? []).filter((item) => !item.bought);

  if (itemsStatus === "pending")
    return <p className="items-loading">Načítavam...</p>;

  if (itemsStatus === "error")
    return <p className="items-error">Chyba pri načítaní položiek.</p>;

  return (
    <main className="outer-wrapper">
      <header>
        Nákupný lístok
        <button onClick={logout}>Odhlásiť sa</button>
      </header>

      <section className="list">
        {items?.length === 0 && (
          <p className="items-empty">
            Zatiaľ nie je žiadna položka na zozname.
          </p>
        )}
        <div className="list-group">
          <h2>Ešte kúpiť</h2>
          <div className="list-items">
            {remainingItems.map((item) => (
              <Item
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onDelete={deleteItem}
              />
            ))}
          </div>
        </div>

        <div className="list-group bought">
          <h2>Kúpené</h2>
          <div className="list-items">
            {boughtItems.map((item) => (
              <Item
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onDelete={deleteItem}
              />
            ))}
          </div>
        </div>
      </section>

      <ItemForm onSubmit={handleAdd} disabled={addItemStatus === "pending"} />
    </main>
  );
}

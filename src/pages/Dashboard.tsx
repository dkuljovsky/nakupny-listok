import Item from "../components/Item";
import ItemForm from "../components/ItemForm";
import Trips from "../components/Trips";
import { useAuthStore } from "../stores/auth";
import useItems from "../hooks/useItems";
import useTrips from "../hooks/useTrips";

export default function Dashboard() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { items, itemsStatus, addItem, updateItem, addItemStatus, deleteItem } =
    useItems();
  const {
    trips,
    status: tripsStatus,
    activeTrip,
    setActiveTrip,
    addTrip,
    deleteTrip,
  } = useTrips();

  function handleAdd(text: string) {
    if (!user) return;

    addItem({ text, bought: false, user: user.id, trip: activeTrip ?? "" });
  }

  function handleAddTrip(name: string) {
    if (!user) return;
    addTrip({ name });
  }

  function toggleItem(id: string) {
    const item = items?.find((item) => item.id === id);
    if (item) updateItem({ id, bought: !item.bought });
  }

  const filteredItems = (items ?? []).filter((item) => {
    if (activeTrip === null) return item.trip === "";

    return activeTrip === item.trip;
  });

  const boughtItems = filteredItems.filter((item) => item.bought);
  const remainingItems = filteredItems.filter((item) => !item.bought);

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
        <Trips
          items={trips ?? []}
          status={tripsStatus}
          activeTrip={activeTrip}
          onSelectTrip={setActiveTrip}
          onAddTrip={handleAddTrip}
          onDeleteTrip={deleteTrip}
        />

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

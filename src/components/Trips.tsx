import { useRef } from "react";
import type { Trip } from "../hooks/useTrips";

const DELETE_HOLD_MS = 2000;

interface TripsProps {
  items: Trip[];
  status: string;
  activeTrip: string | null;
  onSelectTrip: (trip: string | null) => void;
  onAddTrip: (name: string) => void;
  onDeleteTrip: (id: string) => void;
}

function TripTab({
  trip,
  active,
  onSelect,
  onDelete,
}: {
  trip: Trip;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const holdTimer = useRef<number | null>(null);

  function startHold(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    if (holdTimer.current !== null) return;
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      if (window.confirm(`Naozaj odstrániť trip „${trip.name}"?`)) {
        onDelete();
      }
    }, DELETE_HOLD_MS);
  }

  function cancelHold() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  return (
    <label
      className="trip-tab"
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={startHold}
      onTouchEnd={cancelHold}
      onTouchMove={cancelHold}
    >
      {trip.name}
      <input
        type="radio"
        name="trip"
        value={trip.id}
        checked={active}
        onChange={onSelect}
      />
    </label>
  );
}

function Trips({
  items,
  activeTrip,
  onSelectTrip,
  onAddTrip,
  onDeleteTrip,
}: TripsProps) {
  return (
    <div className="trips-tabs">
      <label>
        Nezaradené
        <input
          type="radio"
          name="trip"
          value="nezaradené"
          checked={activeTrip === null}
          onChange={() => onSelectTrip(null)}
        />
      </label>
      {items.map((trip) => (
        <TripTab
          key={trip.id}
          trip={trip}
          active={activeTrip === trip.id}
          onSelect={() => onSelectTrip(trip.id)}
          onDelete={() => onDeleteTrip(trip.id)}
        />
      ))}
      <AddTripForm onAddTrip={onAddTrip} />
    </div>
  );
}

function AddTripForm({ onAddTrip }: { onAddTrip: (name: string) => void }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem(
      "trip-name",
    ) as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;
    onAddTrip(value);
    input.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="trip-add">
      <input
        name="trip-name"
        type="text"
        placeholder="+ Nový trip"
        spellCheck="false"
      />
      <button>Pridať</button>
    </form>
  );
}

export default Trips;

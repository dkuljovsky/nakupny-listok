import { useCallback, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { pb } from "../lib/pocketbase";

export type Trip = {
  id: string;
  name: string;
  created: string;
  updated: string;
  temp?: boolean;
};

export type NewTrip = Omit<Trip, "id" | "created" | "updated">;

const TRIPS_KEY = ["trips"] as const;

export default function useTrips() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const activeTrip = searchParams.get("trip");

  const activeTripRef = useRef(activeTrip);

  useEffect(() => {
    activeTripRef.current = activeTrip;
  }, [activeTrip]);

  const setActiveTrip = useCallback(
    (trip: string | null) => {
      setSearchParams(trip === null ? {} : { trip }, { replace: true });
    },
    [setSearchParams],
  );

  const { data: trips, status } = useQuery({
    queryKey: TRIPS_KEY,
    queryFn: () => pb.collection<Trip>("grocery_trips").getFullList(),
    placeholderData: [],
  });

  useEffect(() => {
    pb.collection("grocery_trips").subscribe("*", (event) => {
      const record = event.record as unknown as Trip;

      switch (event.action) {
        case "create": {
          queryClient.setQueryData<Trip[]>(TRIPS_KEY, (old = []) => {
            if (old.some((trip) => trip.id === record.id)) return old;
            const myTempCreatedTripIndex = old.findIndex(
              (trip) => trip.temp && trip.name === record.name,
            );
            if (myTempCreatedTripIndex === -1) return [...old, record];
            return old.map((trip, index) =>
              index === myTempCreatedTripIndex ? record : trip,
            );
          });
          break;
        }
        case "update": {
          queryClient.setQueryData<Trip[]>(TRIPS_KEY, (old = []) =>
            old.map((trip) => (trip.id === record.id ? record : trip)),
          );
          break;
        }
        case "delete": {
          queryClient.setQueryData<Trip[]>(TRIPS_KEY, (old = []) =>
            old.filter((trip) => trip.id !== record.id),
          );
          if (activeTripRef.current === record.id) setActiveTrip(null);
          break;
        }
      }
    });

    return () => {
      pb.collection("grocery_trips").unsubscribe("*");
    };
  }, [queryClient, setActiveTrip]);

  const { mutate: addTrip, status: addTripStatus } = useMutation({
    mutationFn: async (trip: NewTrip) =>
      (await pb.collection("grocery_trips").create(trip)) as Trip,
    onMutate: async (trip) => {
      await queryClient.cancelQueries({ queryKey: TRIPS_KEY });

      const previousTrips = queryClient.getQueryData<Trip[]>(TRIPS_KEY);

      const tempTrip: Trip = {
        ...trip,
        id: crypto.randomUUID(),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        temp: true,
      };

      queryClient.setQueryData<Trip[]>(TRIPS_KEY, (old = []) => [
        ...(old ?? []),
        tempTrip,
      ]);

      return { previousTrips, tempTrip };
    },
    onSuccess: (created, _trip, context) => {
      if (!context) return;

      queryClient.setQueryData<Trip[]>(TRIPS_KEY, (old = []) => [
        ...(old ?? []).filter(
          (trip) => trip.id !== context.tempTrip.id && trip.id !== created.id,
        ),
        created,
      ]);
    },
    onError: (_err, _trip, context) => {
      if (context?.previousTrips) {
        queryClient.setQueryData(TRIPS_KEY, context.previousTrips);
      }
    },
  });

  const { mutate: deleteTrip, status: deleteTripStatus } = useMutation({
    mutationFn: async (id: string) => pb.collection("grocery_trips").delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TRIPS_KEY });

      const previousTrips = queryClient.getQueryData<Trip[]>(TRIPS_KEY);

      queryClient.setQueryData<Trip[]>(TRIPS_KEY, (old = []) =>
        (old ?? []).filter((trip) => trip.id !== id),
      );

      if (activeTrip === id) setActiveTrip(null);

      return { previousTrips };
    },
    onError: (_err, _id, context) => {
      if (context?.previousTrips) {
        queryClient.setQueryData(TRIPS_KEY, context.previousTrips);
      }
    },
  });

  return {
    activeTrip,
    setActiveTrip,
    trips,
    status,
    addTrip,
    addTripStatus,
    deleteTrip,
    deleteTripStatus,
  };
}

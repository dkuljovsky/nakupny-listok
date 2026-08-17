import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";

type User = {
  name: string;
};

export type Item = {
  id: string;
  text: string;
  bought: boolean;
  created: string;
  updated: string;
  user: string;
  temp?: boolean;
  trip: string;
  expand: {
    user: User;
  };
};

export type NewItem = Omit<Item, "id" | "created" | "updated" | "expand">;

const ITEMS_KEY = ["items"] as const;

export default function useItems() {
  const queryClient = useQueryClient();

  const { data: items, status: itemsStatus } = useQuery<Item[]>({
    queryKey: ITEMS_KEY,
    queryFn: () =>
      pb.collection<Item>("grocery_items").getFullList({ expand: "user" }),
  });

  useEffect(() => {
    pb.collection("grocery_items").subscribe(
      "*",
      (event) => {
        const record = event.record as unknown as Item;

        switch (event.action) {
          case "create": {
            queryClient.setQueryData<Item[]>(ITEMS_KEY, (old = []) => {
              const items = old ?? [];
              if (items.some((item) => item.id === record.id)) return items;

              const myTempCreatedItemIndex = items.findIndex(
                (item) =>
                  item.temp &&
                  item.bought === record.bought &&
                  item.text === record.text &&
                  item.user === record.user,
              );

              if (myTempCreatedItemIndex === -1) return [...items, record];

              return items.map((item, index) =>
                index === myTempCreatedItemIndex ? record : item,
              );
            });
            break;
          }
          case "update": {
            queryClient.setQueryData<Item[]>(ITEMS_KEY, (old = []) =>
              (old ?? []).map((item) =>
                item.id === record.id ? record : item,
              ),
            );
            break;
          }
          case "delete": {
            queryClient.setQueryData<Item[]>(ITEMS_KEY, (old = []) =>
              (old ?? []).filter((item) => item.id !== record.id),
            );
            break;
          }
        }
      },
      {
        expand: "user",
      },
    );

    return () => {
      pb.collection("grocery_items").unsubscribe("*");
    };
  }, [queryClient]);

  const { mutate: addItem, status: addItemStatus } = useMutation({
    mutationFn: async (item: NewItem) =>
      (await pb.collection("grocery_items").create(item)) as Item,
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: ITEMS_KEY });

      const previousItems = queryClient.getQueryData<Item[]>(ITEMS_KEY);

      const tempItem: Item = {
        ...item,
        id: crypto.randomUUID(),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        expand: { user: { name: pb.authStore.record?.name } },
        temp: true,
      };

      queryClient.setQueryData<Item[]>(ITEMS_KEY, (old = []) => [
        ...old,
        tempItem,
      ]);

      return { previousItems, tempItem };
    },
    onSuccess: (created, _item, context) => {
      if (!context) return;

      const createdItem = { ...created, expand: context.tempItem.expand };

      queryClient.setQueryData<Item[]>(ITEMS_KEY, (old = []) => [
        ...(old ?? []).filter(
          (item) =>
            item.id !== context.tempItem.id && item.id !== createdItem.id,
        ),
        createdItem,
      ]);
    },
    onError: (_err, _item, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(ITEMS_KEY, context.previousItems);
      }
    },
  });

  const { mutate: updateItem, status: updateItemStatus } = useMutation({
    mutationFn: async (data: { id: string } & Partial<NewItem>) =>
      pb.collection("grocery_items").update(data.id, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ITEMS_KEY });

      const previousItems = queryClient.getQueryData<Item[]>(ITEMS_KEY);

      queryClient.setQueryData<Item[]>(ITEMS_KEY, (old = []) =>
        old.map((item) => (item.id === data.id ? { ...item, ...data } : item)),
      );

      return { previousItems };
    },
    onError: (_err, _data, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(ITEMS_KEY, context.previousItems);
      }
    },
  });

  const { mutate: deleteItem, status: deleteItemStatus } = useMutation({
    mutationFn: async (id: string) => pb.collection("grocery_items").delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ITEMS_KEY });

      const previousItems = queryClient.getQueryData<Item[]>(ITEMS_KEY);

      queryClient.setQueryData<Item[]>(ITEMS_KEY, (old = []) =>
        old.filter((item) => item.id !== id),
      );

      return { previousItems };
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(ITEMS_KEY, context.previousItems);
      }
    },
  });

  return {
    items,
    itemsStatus,
    addItem,
    addItemStatus,
    updateItem,
    updateItemStatus,
    deleteItem,
    deleteItemStatus,
  };
}

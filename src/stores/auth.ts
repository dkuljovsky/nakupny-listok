import { create } from "zustand";
import { pb } from "../lib/pocketbase";
import { queryClient } from "../lib/queryClient";

export type User = {
  id: string;
  email: string;
  name: string;
};

type AuthState = {
  user: User | null;
  isLoading: boolean;
};

type AuthActions = {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

function currentUser(): User | null {
  return pb.authStore.isValid ? (pb.authStore.record as User | null) : null;
}

export const useAuthStore = create<AuthState & AuthActions>()((set) => {
  pb.authStore.onChange(() => {
    set({ user: currentUser(), isLoading: false });
  }, true);

  return {
    user: currentUser(),
    isLoading: false,
    login: async (email, password) => {
      set({ isLoading: true });
      try {
        await pb.collection("users").authWithPassword(email, password);
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },
    logout: () => {
      pb.authStore.clear();
      queryClient.clear();
    },
  };
});

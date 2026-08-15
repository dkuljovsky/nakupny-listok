# Nákupný lístok

A minimal, mobile-friendly shopping list PWA built with React, TypeScript and Vite. Items sync in realtime with [PocketBase](https://pocketbase.io/) and update optimistically in the UI.

## Stack

- **React 19** + **TypeScript** + **Vite**
- [**PocketBase**](https://pocketbase.io/) — backend / auth / realtime
- [**TanStack Query**](https://tanstack.com/query) — data fetching, mutations, optimistic updates
- [**Zustand**](https://zustand-docs.pmnd.rs/) — auth state
- [**vite-plugin-pwa**](https://vite-pwa-org.netlify.app/) — installable offline-ready PWA
- **CSS** — nested styles with a `:root` token system and `light-dark()` dark mode

## Features

- Email/password login via PocketBase `users` collection
- Protected `/dashboard` route (redirects when unauthenticated)
- Add, toggle (bought), and delete grocery items
- **Realtime** updates via PocketBase subscriptions
- **Optimistic updates** for create, toggle, and delete
- **PWA** — installable, standalone, offline overlay
- **Dark mode** via system preference

## Getting started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure PocketBase

Run a PocketBase instance (e.g. `./pocketbase serve` on `127.0.0.1:8090`) and create:

- A **users** collection (PocketBase's default auth collection)
- A **grocery_items** collection with fields: `text` (text), `bought` (bool), `user` (relation → users)

Then set the API URL in `.env` (defaults to `http://127.0.0.1:8090`):

```bash
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

### 3. Run

```bash
bun run dev      # development server
bun run build    # type-check + production build (emits PWA assets)
bun run preview  # preview the production build
bun run lint     # ESLint
```

## Project structure

```
src/
  components/   # Item, ItemForm, ProtectedRoute, OfflineOverlay
  hooks/        # useItems (query + mutations + realtime)
  lib/          # pocketbase client singleton
  pages/        # Dashboard, Login
  stores/       # auth store (syncs with pb.authStore)
```

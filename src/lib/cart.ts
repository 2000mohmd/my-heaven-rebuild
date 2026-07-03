import { useSyncExternalStore } from "react";

export type CartItem = {
  id: number;
  slug: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
};

const KEY = "hb_cart_v1";
const listeners = new Set<() => void>();
let cache: CartItem[] = [];
let hydrated = false;

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persist(next: CartItem[]) {
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }
  listeners.forEach((l) => l());
}

function ensureHydrated() {
  if (!hydrated && typeof window !== "undefined") {
    cache = read();
    hydrated = true;
  }
}

function subscribe(cb: () => void) {
  ensureHydrated();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  ensureHydrated();
  return cache;
}

function getServerSnapshot(): CartItem[] {
  return [];
}

export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function addToCart(item: Omit<CartItem, "quantity">, qty = 1) {
  ensureHydrated();
  const existing = cache.find((c) => c.id === item.id);
  const next = existing
    ? cache.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + qty } : c))
    : [...cache, { ...item, quantity: qty }];
  persist(next);
}

export function updateQty(id: number, qty: number) {
  ensureHydrated();
  if (qty <= 0) return removeFromCart(id);
  persist(cache.map((c) => (c.id === id ? { ...c, quantity: qty } : c)));
}

export function removeFromCart(id: number) {
  ensureHydrated();
  persist(cache.filter((c) => c.id !== id));
}

export function clearCart() {
  persist([]);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, it) => sum + Number(it.price || 0) * it.quantity, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((n, it) => n + it.quantity, 0);
}

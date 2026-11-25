import { products, type Product } from "./catalog.ts";
export type Cart = Record<string, number>;
export type Sale = {
  id: string;
  date: string;
  items: (Product & { quantity: number })[];
  total: number;
  method: "cash" | "card";
  received: number;
  change: number;
};
export type Data = { cart: Cart; sales: Sale[] };
export const KEY = "cashflow-pos-v1";
export function parseReceived(value: string): number {
  if (!/^\d+(?:[.,]\d{0,2})?$/.test(value)) return 0;
  const cents = Math.round(Number(value.replace(",", ".")) * 100);
  return Number.isSafeInteger(cents) ? cents : 0;
}
export function cartTotal(cart: Cart) {
  return products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0);
}
export function readData(storage: Pick<Storage, "getItem">): Data {
  try {
    const raw = JSON.parse(storage.getItem(KEY) || "{}");
    const cart: Cart = {};
    for (const p of products)
      if (
        Number.isSafeInteger(raw.cart?.[p.id]) &&
        raw.cart[p.id] > 0 &&
        raw.cart[p.id] <= 999
      )
        cart[p.id] = raw.cart[p.id];
    const sales = Array.isArray(raw.sales)
      ? raw.sales.filter(
          (s: Sale) =>
            s &&
            typeof s.id === "string" &&
            typeof s.date === "string" &&
            Number.isFinite(Date.parse(s.date)) &&
            Number.isSafeInteger(s.total) &&
            s.total > 0 &&
            (s.method === "cash" || s.method === "card") &&
            Number.isSafeInteger(s.received) &&
            Number.isSafeInteger(s.change) &&
            Array.isArray(s.items) &&
            s.items.length > 0 &&
            s.items.every(
              (i) =>
                i &&
                typeof i.name === "string" &&
                Number.isSafeInteger(i.quantity) &&
                i.quantity > 0 &&
                Number.isSafeInteger(i.price) &&
                i.price > 0,
            ),
        )
      : [];
    return { cart, sales };
  } catch {
    return { cart: {}, sales: [] };
  }
}
export function completeSale(
  data: Data,
  method: "cash" | "card",
  received: number,
  storage: Pick<Storage, "setItem">,
): Data {
  const total = cartTotal(data.cart);
  if (total <= 0) throw Error("La commande est vide.");
  if (
    method === "cash" &&
    (!Number.isSafeInteger(received) || received < total)
  )
    throw Error("Le montant reçu est insuffisant.");
  const sale: Sale = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    items: products
      .filter((p) => data.cart[p.id])
      .map((p) => ({ ...p, quantity: data.cart[p.id] })),
    total,
    method,
    received: method === "cash" ? received : total,
    change: method === "cash" ? received - total : 0,
  };
  const next = { cart: {}, sales: [sale, ...data.sales] };
  storage.setItem(KEY, JSON.stringify(next));
  return next;
}

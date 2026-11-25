import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { products } from "../src/catalog.ts";
import {
  parseReceived,
  cartTotal,
  readData,
  completeSale,
  KEY,
} from "../src/pos.ts";
const memory = () => {
  const data = {};
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
  };
};
test("catalog has all 16 products and existing local images", () => {
  assert.equal(products.length, 16);
  for (const p of products) assert.ok(existsSync(`public${p.image}`), p.image);
});
test("cash accepts decimal comma and exact centimes", () => {
  assert.equal(parseReceived("3,50"), 350);
  assert.equal(parseReceived("50.00"), 5000);
});
test("cash rejects negative, nonnumeric and excessive precision", () => {
  for (const value of [
    "-1",
    "1e3",
    "12.345",
    "",
    "Infinity",
    "999999999999999999999",
  ])
    assert.equal(parseReceived(value), 0);
});
test("totals use quantity and integer cents", () =>
  assert.equal(cartTotal({ espresso: 3, mojito: 2 }), 3850));
test("restores only valid catalog quantities", () => {
  const store = memory();
  store.setItem(
    KEY,
    JSON.stringify({
      cart: { espresso: 2, mojito: -1, cafe: 1.5, unknown: 3 },
      sales: [],
    }),
  );
  assert.deepEqual(readData(store).cart, { espresso: 2 });
});
test("malformed or blocked storage recovers safely", () => {
  const store = memory();
  store.setItem(KEY, "not-json");
  assert.deepEqual(readData(store), { cart: {}, sales: [] });
  assert.deepEqual(
    readData({
      getItem() {
        throw Error();
      },
    }),
    { cart: {}, sales: [] },
  );
});
test("cash sale saves line snapshots, date, total and change and clears cart atomically", () => {
  const store = memory();
  const result = completeSale(
    { cart: { espresso: 3, mojito: 2 }, sales: [] },
    "cash",
    5000,
    store,
  );
  assert.deepEqual(result.cart, {});
  const sale = result.sales[0];
  assert.equal(sale.total, 3850);
  assert.equal(sale.change, 1150);
  assert.equal(sale.items.length, 2);
  assert.ok(Number.isFinite(Date.parse(sale.date)));
  assert.deepEqual(readData(store), result);
});
test("card sale records exact amount without cash change", () => {
  const result = completeSale(
    { cart: { mojito: 1 }, sales: [] },
    "card",
    0,
    memory(),
  );
  assert.equal(result.sales[0].received, 1400);
  assert.equal(result.sales[0].change, 0);
});
test("underpayment and empty carts never write a sale", () => {
  let writes = 0;
  const store = {
    setItem() {
      writes++;
    },
  };
  assert.throws(() =>
    completeSale({ cart: { mojito: 1 }, sales: [] }, "cash", 1399, store),
  );
  assert.throws(() => completeSale({ cart: {}, sales: [] }, "card", 0, store));
  assert.equal(writes, 0);
});
test("storage failure preserves original cart and history", () => {
  const data = { cart: { espresso: 2 }, sales: [] };
  assert.throws(() =>
    completeSale(data, "cash", 1000, {
      setItem() {
        throw Error("Quota exceeded");
      },
    }),
  );
  assert.deepEqual(data, { cart: { espresso: 2 }, sales: [] });
});
test("subsequent sales retain prior history", () => {
  const store = memory();
  const first = completeSale(
    { cart: { espresso: 1 }, sales: [] },
    "card",
    0,
    store,
  );
  const second = completeSale(
    { ...first, cart: { mojito: 1 } },
    "cash",
    2000,
    store,
  );
  assert.equal(second.sales.length, 2);
  assert.equal(second.sales[1].id, first.sales[0].id);
});

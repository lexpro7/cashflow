import test from "node:test";
import assert from "node:assert/strict";
import {
  languages,
  LANGUAGE_KEY,
  readLanguage,
  saveLanguage,
  translate,
  translations,
  productName,
  categoryName,
  productNames,
  categoryNames,
  formatCount,
  locales,
} from "../src/i18n.ts";
import { products, categories, money } from "../src/catalog.ts";
import { completeSale, readData, KEY } from "../src/pos.ts";
const memory = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};
test("French is the default with missing, invalid or blocked preferences", () => {
  const storage = memory();
  assert.equal(readLanguage(storage), "fr");
  storage.setItem(LANGUAGE_KEY, "de");
  assert.equal(readLanguage(storage), "fr");
  assert.equal(
    readLanguage({
      getItem() {
        throw Error("Blocked");
      },
    }),
    "fr",
  );
});
test("each language persists and restores without changing cart or sales", () => {
  const storage = memory();
  const data = completeSale(
    { cart: { espresso: 1 }, sales: [] },
    "card",
    0,
    storage,
  );
  const saved = storage.getItem(KEY);
  for (const language of languages) {
    saveLanguage(storage, language);
    assert.equal(readLanguage(storage), language);
    assert.equal(storage.getItem(KEY), saved);
    assert.deepEqual(readData(storage), data);
  }
  assert.doesNotThrow(() =>
    saveLanguage(
      {
        setItem() {
          throw Error("Blocked");
        },
      },
      "ru",
    ),
  );
});
test("every interface phrase has three nonempty translations", () => {
  for (const key of Object.keys(translations))
    for (const language of languages)
      assert.ok(translate(language, key).trim(), `${language}: ${key}`);
  assert.equal(translate("en", "Encaisser"), "Checkout");
  assert.equal(translate("ru", "Encaisser"), "Оплатить");
});
test("all products and categories are translated using stable IDs", () => {
  for (const p of products) {
    assert.ok(productNames[p.id]);
    for (const language of languages) assert.ok(productName(language, p));
  }
  for (const category of categories) {
    assert.ok(categoryNames[category]);
    for (const language of languages)
      assert.ok(categoryName(language, category));
  }
  assert.equal(
    productName("ru", { id: "mojito", name: "Old saved name" }),
    "Мохито",
  );
  assert.equal(
    productName("en", { id: "removed-product", name: "Archived product" }),
    "Archived product",
  );
});
test("Russian plural forms cover singular, few and many, including teens", () => {
  for (const [n, label] of [
    [1, "позиция"],
    [2, "позиции"],
    [5, "позиций"],
    [11, "позиций"],
    [21, "позиция"],
    [22, "позиции"],
    [25, "позиций"],
    [0, "позиций"],
  ])
    assert.equal(formatCount("ru", "items", n), `${n} ${label}`);
  assert.equal(formatCount("en", "items", 1), "1 item");
  assert.equal(formatCount("en", "items", 2), "2 items");
  assert.equal(formatCount("fr", "items", 2), "2 articles");
});
test("monetary formatting follows locale while keeping CHF centime precision", () => {
  assert.equal(money(350, locales.en), "3.50");
  assert.equal(money(350, locales.ru), "3,50");
  assert.equal(money(350), money(350, locales.fr));
});

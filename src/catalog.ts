export const categories = [
  "Tous",
  "Long Drinks",
  "Cocktails",
  "Apéritifs",
  "Shots",
  "Café",
] as const;
export type Category = (typeof categories)[number];
export type Product = {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  image: string;
};
export const products: Product[] = [
  ["gin-tonic", "Gin Tonic", 1000, "Long Drinks", "Gin, tonic & citron"],
  ["vodka-orange", "Vodka Orange", 1000, "Long Drinks", "Vodka & jus d’orange"],
  ["rhum-cola", "Rhum Cola", 1000, "Long Drinks", "Rhum, cola & citron vert"],
  ["vodka-red-bull", "Vodka Red Bull", 1200, "Long Drinks", "Vodka & Red Bull"],
  ["mojito", "Mojito", 1400, "Cocktails", "Rhum, menthe & citron vert"],
  [
    "aperol-spritz",
    "Aperol Spritz",
    1400,
    "Cocktails",
    "Aperol, prosecco & eau pétillante",
  ],
  [
    "blue-lagoon",
    "Blue Lagoon",
    1400,
    "Cocktails",
    "Vodka, curaçao bleu & citron",
  ],
  [
    "tequila-sunrise",
    "Tequila Sunrise",
    1400,
    "Cocktails",
    "Tequila, orange & grenadine",
  ],
  ["daiquiri", "Daiquiri", 1400, "Cocktails", "Rhum, citron vert & sucre"],
  [
    "sex-on-the-beach",
    "Sex on the Beach",
    1400,
    "Cocktails",
    "Vodka, pêche, orange & cranberry",
  ],
  ["suze", "Suze", 500, "Apéritifs", "Apéritif à la gentiane"],
  ["ricard", "Ricard", 500, "Apéritifs", "Pastis de Marseille"],
  ["jagermeister", "Jägermeister", 500, "Shots", "Liqueur aux plantes"],
  ["tequila", "Tequila", 500, "Shots", "Tequila, sel & citron"],
  ["cafe", "Café", 400, "Café", "Café allongé"],
  ["espresso", "Espresso", 350, "Café", "Court & intense"],
].map(([id, name, price, category, description], index) => ({
  id: String(id),
  name: String(name),
  price: Number(price),
  category: category as Category,
  description: String(description),
  image: `/images/${id}.${index < 10 ? "jpg" : "png"}`,
}));
export const money = (cents: number, locale = "fr-CH") =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

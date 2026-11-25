import { mkdir, writeFile } from "node:fs/promises";
await mkdir("public/images", { recursive: true });
const drinks = [
  ["gin-tonic", "Gin And Tonic"],
  ["vodka-orange", "Screwdriver"],
  ["rhum-cola", "Cuba Libre"],
  ["vodka-red-bull", "Vodka Tonic"],
  ["mojito", "Mojito"],
  ["aperol-spritz", "Spritz"],
  ["blue-lagoon", "Blue Lagoon"],
  ["tequila-sunrise", "Tequila Sunrise"],
  ["daiquiri", "Daiquiri"],
  ["sex-on-the-beach", "Sex on the Beach"],
];
const credits = [];
for (const [id, query] of drinks) {
  const res = await fetch(
    "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=" +
      encodeURIComponent(query),
  );
  const data = await res.json();
  const drink =
    data.drinks?.find(
      (d) => d.strDrink.toLowerCase() === query.toLowerCase(),
    ) ?? data.drinks?.[0];
  if (!drink) throw Error("No image: " + query);
  const image = await fetch(drink.strDrinkThumb);
  if (!image.ok) throw Error("Image failed " + id);
  await writeFile(
    "public/images/" + id + ".jpg",
    Buffer.from(await image.arrayBuffer()),
  );
  credits.push({
    id,
    title: drink.strDrink,
    source: drink.strDrinkThumb,
    attribution: drink.strImageAttribution,
    illustrative: id === "vodka-red-bull",
  });
  console.log(id);
}
for (const [id, ingredient] of [
  ["jagermeister", "Jagermeister"],
  ["tequila", "Tequila"],
  ["cafe", "Coffee"],
  ["espresso", "Espresso"],
]) {
  const url =
    "https://www.thecocktaildb.com/images/ingredients/" + ingredient + ".png";
  const res = await fetch(url);
  if (!res.ok) throw Error("Ingredient failed " + id);
  await writeFile(
    "public/images/" + id + ".png",
    Buffer.from(await res.arrayBuffer()),
  );
  credits.push({ id, source: url });
  console.log(id);
}
for (const [id, query] of [
  ["suze", 'intitle:"Bottle-of-Suze"'],
  ["ricard", 'intitle:"Ricard" bottle'],
]) {
  const api =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
    encodeURIComponent(query) +
    "&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url%7Cextmetadata&iiurlwidth=500&format=json";
  const result = await (await fetch(api)).json();
  const pages = Object.values(result.query.pages).sort(
    (a, b) => a.index - b.index,
  );
  const page = pages.find((p) => p.imageinfo?.[0]?.url?.match(/\.jpg/i));
  if (!page) throw Error("No commons photograph: " + id);
  const info = page.imageinfo[0];
  const image = await fetch(info.thumburl || info.url);
  if (!image.ok) throw Error("Commons download failed: " + id);
  await writeFile(
    "public/images/" + id + ".png",
    Buffer.from(await image.arrayBuffer()),
  );
  credits.push({
    id,
    source: info.descriptionurl,
    author: info.extmetadata?.Artist?.value,
    license: info.extmetadata?.LicenseShortName?.value,
  });
  console.log(id);
}
await writeFile("public/images/credits.json", JSON.stringify(credits, null, 2));

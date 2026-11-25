export const languages = ["fr", "en", "ru"] as const;
export type Language = (typeof languages)[number];
export const LANGUAGE_KEY = "cashflow-language";
export const locales = { fr: "fr-CH", en: "en-GB", ru: "ru-RU" };
export function readLanguage(storage: Pick<Storage, "getItem">): Language {
  try {
    const value = storage.getItem(LANGUAGE_KEY);
    return languages.includes(value as Language) ? (value as Language) : "fr";
  } catch {
    return "fr";
  }
}
export function saveLanguage(
  storage: Pick<Storage, "setItem">,
  language: Language,
) {
  try {
    storage.setItem(LANGUAGE_KEY, language);
  } catch {
    /* The current session can still change language. */
  }
}
export const translations = {
  "CashFlow, accueil": ["CashFlow, home", "CashFlow, главная"],
  "Le comptoir": ["The counter", "Барная стойка"],
  Caisse: ["Register", "Касса"],
  Langue: ["Language", "Язык"],
  "Activer le thème clair": ["Switch to light theme", "Включить светлую тему"],
  "Activer le thème sombre": ["Switch to dark theme", "Включить тёмную тему"],
  "Changer de thème": ["Change theme", "Изменить тему"],
  "Quitter le plein écran": [
    "Exit fullscreen",
    "Выйти из полноэкранного режима",
  ],
  "Plein écran": ["Fullscreen", "Полный экран"],
  Bar: ["Bar", "Бар"],
  "La carte": ["The menu", "Меню"],
  "Catégories de boissons": ["Drink categories", "Категории напитков"],
  Historique: ["History", "История"],
  "À propos": ["About", "О приложении"],
  "Prêt pour le service": ["Ready for service", "Всё готово к работе"],
  "À vous de jouer.": ["Make it a great shift.", "Можно начинать."],
  "Les bons ingrédients d’une belle soirée.": [
    "The right ingredients for a great evening.",
    "Всё для прекрасного вечера.",
  ],
  "Rechercher une boisson": ["Search for a drink", "Найти напиток"],
  "Rechercher une boisson…": ["Search for a drink…", "Найти напиток…"],
  "Effacer la recherche": ["Clear search", "Очистить поиск"],
  "À la carte": ["On the menu", "В меню"],
  "Résultats de recherche": ["Search results", "Результаты поиска"],
  "Toutes les boissons": ["All drinks", "Все напитки"],
  "Prix en CHF": ["Prices in CHF", "Цены в CHF"],
  "Aucune boisson trouvée": ["No drinks found", "Напитки не найдены"],
  "Essayez un autre nom.": ["Try another name.", "Попробуйте другое название."],
  "Voir toute la carte": ["View the full menu", "Показать всё меню"],
  "Un verre à la fois, une belle soirée.": [
    "A great evening, one drink at a time.",
    "Хороший вечер начинается с напитка.",
  ],
  "Commande en cours": ["Current order", "Текущий заказ"],
  "Au comptoir": ["At the counter", "У стойки"],
  "Fermer le panier": ["Close cart", "Закрыть корзину"],
  Vider: ["Clear", "Очистить"],
  "Le premier verre ?": ["The first drink?", "Первый напиток?"],
  "Touchez une boisson pour": ["Tap a drink to", "Нажмите на напиток,"],
  "commencer la commande.": ["start your order.", "чтобы начать заказ."],
  "Sous-total": ["Subtotal", "Подытог"],
  Total: ["Total", "Итого"],
  Encaisser: ["Checkout", "Оплатить"],
  "Espèces ou carte bancaire": ["Cash or card", "Наличные или карта"],
  "Fermer la notification": ["Dismiss notification", "Закрыть уведомление"],
  "Fermer l’erreur": ["Dismiss error", "Закрыть сообщение об ошибке"],
  "Encaisser la commande": ["Checkout", "Оплата заказа"],
  "Historique des ventes": ["Sales history", "История продаж"],
  "Vider la commande ?": ["Clear this order?", "Очистить заказ?"],
  "Votre comptoir digital": ["Your digital counter", "Ваша цифровая касса"],
  Fermer: ["Close", "Закрыть"],
  "Mode de paiement": ["Payment method", "Способ оплаты"],
  "Carte bancaire": ["Card", "Карта"],
  Espèces: ["Cash", "Наличные"],
  "Montant reçu (CHF)": ["Amount received (CHF)", "Получено (CHF)"],
  Exact: ["Exact", "Без сдачи"],
  "Monnaie à rendre": ["Change due", "Сдача"],
  "Saisissez un montant valide couvrant le total.": [
    "Enter a valid amount covering the total.",
    "Введите корректную сумму не меньше итога.",
  ],
  "Effectuez le paiement sur votre terminal bancaire, puis confirmez ici. Aucun débit n’est effectué par l’application.":
    [
      "Take payment on your card terminal, then confirm here. The application does not charge the card.",
      "Примите оплату на банковском терминале, затем подтвердите здесь. Приложение не списывает деньги с карты.",
    ],
  "Confirmer le paiement reçu": [
    "Confirm payment received",
    "Подтвердить получение оплаты",
  ],
  "Valider le paiement": ["Confirm payment", "Подтвердить оплату"],
  "Revenir à la commande": ["Back to order", "Вернуться к заказу"],
  Conserver: ["Keep order", "Сохранить заказ"],
  "Vider la commande": ["Clear order", "Очистить заказ"],
  Exporter: ["Export", "Экспорт"],
  "Montant reçu": ["Amount received", "Получено"],
  "Monnaie rendue": ["Change given", "Выданная сдача"],
  "Le service commence ici": [
    "Your shift starts here",
    "Ваша смена начинается здесь",
  ],
  "Vos commandes encaissées apparaîtront ici.": [
    "Completed orders will appear here.",
    "Здесь появятся оплаченные заказы.",
  ],
  "Données conservées dans ce navigateur. Exportez vos ventes pour les sauvegarder.":
    [
      "Data is stored in this browser. Export your sales to back them up.",
      "Данные хранятся в этом браузере. Экспортируйте продажи для резервного копирования.",
    ],
  "La caisse pensée pour votre bar. Commandes, encaissements et historique, au même endroit.":
    [
      "A register designed for your bar. Orders, payments and history, all in one place.",
      "Касса для вашего бара. Заказы, оплаты и история — в одном месте.",
    ],
  "Les données sont stockées uniquement sur cet appareil, dans ce navigateur. Aucun compte ni serveur n’est nécessaire.":
    [
      "Data is stored only on this device, in this browser. No account or server is needed.",
      "Данные хранятся только на этом устройстве, в этом браузере. Учётная запись и сервер не нужны.",
    ],
  "Photographies :": ["Photographs:", "Фотографии:"],
  "et Wikimedia Commons. Les visuels sont illustratifs.": [
    "and Wikimedia Commons. Images are illustrative.",
    "и Wikimedia Commons. Изображения приведены для иллюстрации.",
  ],
  "Crédits des images": ["Image credits", "Авторы изображений"],
  "Enregistrement impossible. Le stockage de ce navigateur est indisponible ou plein. La commande est conservée à l’écran.":
    [
      "Unable to save. Browser storage is unavailable or full. The order remains on screen.",
      "Не удалось сохранить. Хранилище браузера недоступно или заполнено. Заказ остаётся на экране.",
    ],
  "Maximum de 999 unités par produit.": [
    "Maximum of 999 units per product.",
    "Не более 999 единиц одного товара.",
  ],
  "Le plein écran n’est pas disponible dans ce navigateur.": [
    "Fullscreen is unavailable in this browser.",
    "Полноэкранный режим недоступен в этом браузере.",
  ],
  "La vente n’a pas pu être enregistrée. Vérifiez le stockage du navigateur, puis réessayez.":
    [
      "The sale could not be saved. Check browser storage and try again.",
      "Не удалось сохранить продажу. Проверьте хранилище браузера и повторите попытку.",
    ],
  Ajouter: ["Add", "Добавить"],
  Supprimer: ["Remove", "Удалить"],
  Diminuer: ["Decrease", "Уменьшить количество"],
  Augmenter: ["Increase", "Увеличить количество"],
  unité: ["unit", "шт."],
  Commande: ["Order", "Заказ"],
  "Paiement enregistré :": ["Payment recorded:", "Оплата сохранена:"],
  "monnaie :": ["change:", "сдача:"],
  "à régler": ["to pay", "к оплате"],
  "Les articles seront retirés de la commande en cours.": [
    "The items will be removed from the current order.",
    "Позиции будут удалены из текущего заказа.",
  ],
  "CashFlow — Le comptoir": [
    "CashFlow — The counter",
    "CashFlow — Барная стойка",
  ],
} as const;
export type TranslationKey = keyof typeof translations;
export function translate(language: Language, key: TranslationKey): string {
  return language === "fr" ? key : translations[key][language === "en" ? 0 : 1];
}
export const categoryNames: Record<string, readonly [string, string, string]> =
  {
    Tous: ["Tous", "All", "Все"],
    "Long Drinks": ["Long Drinks", "Long drinks", "Лонг-дринки"],
    Cocktails: ["Cocktails", "Cocktails", "Коктейли"],
    Apéritifs: ["Apéritifs", "Aperitifs", "Аперитивы"],
    Shots: ["Shots", "Shots", "Шоты"],
    Café: ["Café", "Coffee", "Кофе"],
  };
export const productNames: Record<string, readonly [string, string, string]> = {
  "gin-tonic": ["Gin Tonic", "Gin & Tonic", "Джин-тоник"],
  "vodka-orange": [
    "Vodka Orange",
    "Vodka Orange",
    "Водка с апельсиновым соком",
  ],
  "rhum-cola": ["Rhum Cola", "Rum & Cola", "Ром с колой"],
  "vodka-red-bull": ["Vodka Red Bull", "Vodka Red Bull", "Водка с Red Bull"],
  mojito: ["Mojito", "Mojito", "Мохито"],
  "aperol-spritz": ["Aperol Spritz", "Aperol Spritz", "Апероль Шприц"],
  "blue-lagoon": ["Blue Lagoon", "Blue Lagoon", "Голубая лагуна"],
  "tequila-sunrise": ["Tequila Sunrise", "Tequila Sunrise", "Текила Санрайз"],
  daiquiri: ["Daiquiri", "Daiquiri", "Дайкири"],
  "sex-on-the-beach": ["Sex on the Beach", "Sex on the Beach", "Секс на пляже"],
  suze: ["Suze", "Suze", "Сюз"],
  ricard: ["Ricard", "Ricard", "Рикар"],
  jagermeister: ["Jägermeister", "Jägermeister", "Егермейстер"],
  tequila: ["Tequila", "Tequila", "Текила"],
  cafe: ["Café", "Coffee", "Кофе"],
  espresso: ["Espresso", "Espresso", "Эспрессо"],
};
export function categoryName(language: Language, category: string) {
  return categoryNames[category]?.[languages.indexOf(language)] ?? category;
}
export function productName(
  language: Language,
  product: { id: string; name: string },
) {
  return (
    productNames[product.id]?.[languages.indexOf(language)] ?? product.name
  );
}
export function formatCount(
  language: Language,
  kind: "items" | "products" | "sales",
  count: number,
) {
  const forms = {
    fr: {
      items: ["article", "articles", "articles"],
      products: ["produit", "produits", "produits"],
      sales: [
        "vente enregistrée",
        "ventes enregistrées",
        "ventes enregistrées",
      ],
    },
    en: {
      items: ["item", "items", "items"],
      products: ["product", "products", "products"],
      sales: ["recorded sale", "recorded sales", "recorded sales"],
    },
    ru: {
      items: ["позиция", "позиции", "позиций"],
      products: ["товар", "товара", "товаров"],
      sales: ["продажа записана", "продажи записаны", "продаж записано"],
    },
  };
  const plural = new Intl.PluralRules(locales[language]).select(count);
  return `${count} ${forms[language][kind][plural === "one" ? 0 : plural === "few" ? 1 : 2]}`;
}

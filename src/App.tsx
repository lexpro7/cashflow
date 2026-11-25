import { useEffect, useRef, useState } from "react";
import {
  Martini,
  Search,
  Plus,
  Minus,
  Trash2,
  X,
  Moon,
  Sun,
  Maximize,
  Minimize,
  Grid2X2,
  Wine,
  GlassWater,
  Coffee,
  History,
  ShoppingBag,
  CreditCard,
  Banknote,
  Check,
  ChevronRight,
  ArrowLeft,
  ReceiptText,
  Download,
  CircleHelp,
} from "lucide-react";
import {
  categories,
  products,
  money as formatMoney,
  type Category,
} from "./catalog";
import { readData, parseReceived, completeSale, KEY, type Data } from "./pos";

import {
  languages,
  locales,
  readLanguage,
  saveLanguage,
  translate,
  categoryName,
  productName,
  formatCount,
  type Language,
  type TranslationKey,
} from "./i18n";

const catIcons = [Grid2X2, GlassWater, Martini, Wine, GlassWater, Coffee];
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return readLanguage(localStorage);
    } catch {
      return "fr";
    }
  });
  const t = (key: TranslationKey) => translate(language, key);
  const money = (cents: number) => formatMoney(cents, locales[language]);
  const name = (p: { id: string; name: string }) => productName(language, p);
  const cat = (c: string) => categoryName(language, c);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate(language, "CashFlow — Le comptoir");
    try {
      saveLanguage(localStorage, language);
    } catch {
      /* Storage may be blocked. */
    }
  }, [language]);
  const [data, setData] = useState<Data>(() => {
    try {
      return readData(localStorage);
    } catch {
      return { cart: {}, sales: [] };
    }
  });
  const [category, setCategory] = useState<Category>("Tous");
  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("cashflow-theme") === "dark";
    } catch {
      return false;
    }
  });
  const [fullscreen, setFullscreen] = useState(false);
  const [modal, setModal] = useState<
    "checkout" | "history" | "clear" | "about" | null
  >(null);
  const [method, setMethod] = useState<"cash" | "card">("card");
  const [received, setReceived] = useState("");
  const [notice, setNotice] = useState<
    TranslationKey | { total: number; change: number } | ""
  >("");
  const [error, setError] = useState<TranslationKey | "">("");
  const [mobileCart, setMobileCart] = useState(false);
  const [now, setNow] = useState(new Date());
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);
  const rows = products.filter((p) => data.cart[p.id]);
  const count = rows.reduce((s, p) => s + data.cart[p.id], 0);
  const total = rows.reduce((s, p) => s + p.price * data.cart[p.id], 0);
  const receivedCents = parseReceived(received);
  const canPay =
    count > 0 &&
    (method === "card" ||
      (Number.isSafeInteger(receivedCents) && receivedCents >= total));
  const visible = products.filter(
    (p) =>
      (category === "Tous" || p.category === category) &&
      [p.name, name(p)].some((value) =>
        normalize(value).includes(normalize(search)),
      ),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("cashflow-theme", dark ? "dark" : "light");
    } catch {
      /* Noncritical preference. */
    }
  }, [dark]);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    const change = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", change);
    return () => {
      clearInterval(id);
      document.removeEventListener("fullscreenchange", change);
    };
  }, []);
  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => setNotice(""), 4500);
      return () => clearTimeout(id);
    }
  }, [notice]);
  useEffect(() => {
    if (modal) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [modal]);
  function save(next: Data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setData(next);
      setError("");
      return true;
    } catch {
      setError(
        "Enregistrement impossible. Le stockage de ce navigateur est indisponible ou plein. La commande est conservée à l’écran.",
      );
      return false;
    }
  }
  function update(id: string, delta: number) {
    const cart = { ...data.cart };
    const q = (cart[id] || 0) + delta;
    if (q > 999) {
      setNotice("Maximum de 999 unités par produit.");
      return;
    }
    if (q <= 0) delete cart[id];
    else cart[id] = q;
    const next = { ...data, cart };
    if (!save(next)) setData(next);
  }
  function remove(id: string) {
    const cart = { ...data.cart };
    delete cart[id];
    const next = { ...data, cart };
    if (!save(next)) setData(next);
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      setNotice("Le plein écran n’est pas disponible dans ce navigateur.");
    }
  }
  function checkout() {
    if (!canPay || busy.current) return;
    busy.current = true;
    try {
      const next = completeSale(data, method, receivedCents, localStorage);
      setData(next);
      setError("");
      setModal(null);
      setMobileCart(false);
      setNotice({ total, change: next.sales[0].change });
    } catch {
      setError(
        "La vente n’a pas pu être enregistrée. Vérifiez le stockage du navigateur, puis réessayez.",
      );
    } finally {
      busy.current = false;
    }
  }
  function exportSales() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data.sales, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `cashflow-ventes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function openCheckout() {
    setReceived("");
    setMethod("card");
    setModal("checkout");
  }

  return (
    <div className="app-shell">
      <header className="topbar flex items-center justify-between">
        <a
          className="brand flex items-center gap-3"
          href="./"
          aria-label={t("CashFlow, accueil")}
        >
          <span className="brand-icon">
            <Martini size={23} />
          </span>
          <span>
            cashflow<span className="brand-period">.</span>
          </span>
        </a>
        <div className="workspace-name">
          <span className="divider" />
          <span>{t("Le comptoir")}</span>
          <span className="workspace-tag">{t("Caisse")}</span>
        </div>
        <div className="top-actions flex items-center gap-2">
          <div
            className="language-switcher"
            role="group"
            aria-label={t("Langue")}
          >
            {languages.map((value) => (
              <button
                key={value}
                type="button"
                lang={value}
                aria-label={
                  { fr: "Français", en: "English", ru: "Русский" }[value]
                }
                aria-pressed={language === value}
                onClick={() => setLanguage(value)}
              >
                {value.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="date">
            {now.toLocaleDateString(locales[language], {
              day: "numeric",
              month: "long",
            })}
            <strong>
              {now.toLocaleTimeString(locales[language], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
          </span>
          <button
            className="icon-button"
            onClick={() => setDark(!dark)}
            aria-label={
              dark ? t("Activer le thème clair") : t("Activer le thème sombre")
            }
            title={t("Changer de thème")}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            className="icon-button fullscreen-button"
            onClick={toggleFullscreen}
            aria-label={
              fullscreen ? t("Quitter le plein écran") : t("Plein écran")
            }
            title={t("Plein écran")}
          >
            {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <span className="avatar" aria-label={t("Bar")}>
            B
          </span>
        </div>
      </header>
      <div className="main-layout">
        <aside className="sidebar flex flex-col">
          <p className="sidebar-label">{t("La carte")}</p>
          <nav
            aria-label={t("Catégories de boissons")}
            className="category-nav"
          >
            {categories.map((c, i) => {
              const Icon = catIcons[i];
              return (
                <button
                  key={c}
                  className={`category-button flex items-center ${category === c ? "selected" : ""}`}
                  onClick={() => {
                    setCategory(c);
                    setSearch("");
                  }}
                  aria-pressed={category === c}
                >
                  <Icon size={20} />
                  <span>{cat(c)}</span>
                  <span className="category-count">
                    {c === "Tous"
                      ? products.length
                      : products.filter((p) => p.category === c).length}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="sidebar-bottom">
            <button
              className="utility-button"
              onClick={() => setModal("history")}
            >
              <History size={20} />
              {t("Historique")}
              <span className="history-count">{data.sales.length}</span>
            </button>
            <button
              className="utility-button"
              onClick={() => setModal("about")}
            >
              <CircleHelp size={20} />
              {t("À propos")}
            </button>
            <div className="sidebar-foot">
              <span className="small-logo">
                <Martini size={18} />
              </span>
              <div>
                <strong>{t("Prêt pour le service")}</strong>
                <span>{t("À vous de jouer.")}</span>
              </div>
            </div>
          </div>
        </aside>
        <main className="catalog" id="main">
          <div className="catalog-heading flex items-center justify-between">
            <div>
              <h1>{category === "Tous" ? t("La carte") : cat(category)}</h1>
              <p>{t("Les bons ingrédients d’une belle soirée.")}</p>
            </div>
            <span className="product-total">
              {formatCount(language, "products", products.length)}
            </span>
          </div>
          <div className="search-box flex items-center gap-3">
            <Search size={20} />
            <input
              aria-label={t("Rechercher une boisson")}
              placeholder={t("Rechercher une boisson…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search ? (
              <button
                className="icon-button"
                aria-label={t("Effacer la recherche")}
                onClick={() => setSearch("")}
              >
                <X size={18} />
              </button>
            ) : (
              <span className="search-hint">{t("À la carte")}</span>
            )}
          </div>
          <div className="section-line flex items-center justify-between">
            <h2>
              {search
                ? t("Résultats de recherche")
                : category === "Tous"
                  ? t("Toutes les boissons")
                  : cat(category)}
              <span>{visible.length}</span>
            </h2>
            <span>{t("Prix en CHF")}</span>
          </div>
          {visible.length ? (
            <div className="product-grid">
              {visible.map((p) => (
                <button
                  key={p.id}
                  className={`product-card ${data.cart[p.id] ? "in-cart" : ""}`}
                  onClick={() => update(p.id, 1)}
                  aria-label={`${t("Ajouter")} ${name(p)}, ${money(p.price)} CHF`}
                >
                  <div
                    className={`product-image ${["Apéritifs", "Shots", "Café"].includes(p.category) ? "bottle" : ""}`}
                  >
                    <img
                      src={p.image}
                      alt={name(p)}
                      loading={p.id === visible[0]?.id ? "eager" : "lazy"}
                    />
                    {data.cart[p.id] > 0 && (
                      <span className="quantity-badge">{data.cart[p.id]}</span>
                    )}
                    <span className="add-product">
                      <Plus size={20} />
                    </span>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{cat(p.category)}</span>
                    <h3>{name(p)}</h3>
                    <div className="product-price">
                      {money(p.price)}
                      <span>CHF</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <Search size={32} />
              <h3>{t("Aucune boisson trouvée")}</h3>
              <p>{t("Essayez un autre nom.")}</p>
              <button
                className="secondary-button"
                onClick={() => {
                  setSearch("");
                  setCategory("Tous");
                }}
              >
                {t("Voir toute la carte")}
              </button>
            </div>
          )}
          <div className="catalog-footer">
            <Martini size={15} />
            <span>{t("Un verre à la fois, une belle soirée.")}</span>
          </div>
        </main>
        <aside
          className={`order-panel ${mobileCart ? "mobile-open" : ""}`}
          aria-label={t("Commande en cours")}
        >
          <div className="order-heading flex items-center justify-between">
            <div>
              <h2>{t("Commande en cours")}</h2>
              <p>
                {t("Au comptoir")}{" "}
                <span className="order-number">
                  #{String(data.sales.length + 1).padStart(3, "0")}
                </span>
              </p>
            </div>
            <button
              className="icon-button mobile-close"
              aria-label={t("Fermer le panier")}
              onClick={() => setMobileCart(false)}
            >
              <X size={22} />
            </button>
            <span className="order-icon">
              <ReceiptText size={23} />
            </span>
          </div>
          <div className="order-toolbar flex items-center justify-between">
            <span>{formatCount(language, "items", count)}</span>
            <button disabled={!count} onClick={() => setModal("clear")}>
              <Trash2 size={15} />
              {t("Vider")}
            </button>
          </div>
          <div className="order-items">
            {rows.length ? (
              rows.map((p) => (
                <div className="order-item" key={p.id}>
                  <img src={p.image} alt="" />
                  <div className="order-item-main">
                    <div className="flex justify-between gap-2">
                      <h3>{name(p)}</h3>
                      <button
                        className="remove-item"
                        onClick={() => remove(p.id)}
                        aria-label={`${t("Supprimer")} ${name(p)}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <span className="unit-price">
                      {money(p.price)} CHF / {t("unité")}
                    </span>
                    <div className="item-bottom flex items-center justify-between">
                      <div className="quantity-control flex items-center">
                        <button
                          onClick={() => update(p.id, -1)}
                          aria-label={`${t("Diminuer")} ${name(p)}`}
                        >
                          <Minus size={16} />
                        </button>
                        <span>{data.cart[p.id]}</span>
                        <button
                          onClick={() => update(p.id, 1)}
                          aria-label={`${t("Augmenter")} ${name(p)}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <strong>
                        {money(p.price * data.cart[p.id])}
                        <small> CHF</small>
                      </strong>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-cart">
                <span>
                  <ShoppingBag size={32} strokeWidth={1.3} />
                </span>
                <h3>{t("Le premier verre ?")}</h3>
                <p>
                  {t("Touchez une boisson pour")}
                  <br />
                  {t("commencer la commande.")}
                </p>
                <div className="empty-line" />
              </div>
            )}
          </div>
          <div className="order-summary">
            <div className="summary-row">
              <span>{t("Sous-total")}</span>
              <span>{money(total)} CHF</span>
            </div>
            <div className="total-row">
              <span>{t("Total")}</span>
              <strong>
                {money(total)} <small>CHF</small>
              </strong>
            </div>
            <button
              className="primary-button checkout-button"
              disabled={!count}
              onClick={openCheckout}
            >
              <CreditCard size={20} />
              <span>{t("Encaisser")}</span>
              <ChevronRight size={20} />
            </button>
            <p className="payment-note">
              <Banknote size={14} />
              {t("Espèces ou carte bancaire")}
            </p>
          </div>
        </aside>
      </div>
      <button
        className="mobile-cart-button primary-button"
        onClick={() => setMobileCart(true)}
      >
        <ShoppingBag size={20} />
        {t("Commande")} ({count})<strong>{money(total)} CHF</strong>
      </button>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {typeof notice === "string"
            ? t(notice)
            : `${t("Paiement enregistré :")} ${money(notice.total)} CHF${notice.change > 0 ? `, ${t("monnaie :")} ${money(notice.change)} CHF` : ""}`}
          <button
            aria-label={t("Fermer la notification")}
            onClick={() => setNotice("")}
          >
            <X size={18} />
          </button>
        </div>
      )}
      {error && (
        <div className="error-banner" role="alert">
          {t(error)}
          <button
            onClick={() => setError("")}
            aria-label={t("Fermer l’erreur")}
          >
            <X size={20} />
          </button>
        </div>
      )}
      <dialog
        ref={dialog}
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setModal(null);
        }}
        className={modal === "history" ? "wide-dialog" : ""}
      >
        <div className="dialog-header">
          <h2>
            {modal === "checkout"
              ? t("Encaisser la commande")
              : modal === "history"
                ? t("Historique des ventes")
                : modal === "clear"
                  ? t("Vider la commande ?")
                  : t("Votre comptoir digital")}
          </h2>
          <button
            className="icon-button"
            aria-label={t("Fermer")}
            onClick={() => setModal(null)}
          >
            <X size={22} />
          </button>
        </div>
        {modal === "checkout" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkout();
            }}
          >
            <div className="checkout-total">
              <span>
                {formatCount(language, "items", count)} {t("à régler")}
              </span>
              <strong>
                {money(total)} <small>CHF</small>
              </strong>
            </div>
            <fieldset>
              <legend>{t("Mode de paiement")}</legend>
              <div className="payment-options">
                <button
                  type="button"
                  className={method === "card" ? "active" : ""}
                  aria-pressed={method === "card"}
                  onClick={() => setMethod("card")}
                >
                  <CreditCard size={24} />
                  {t("Carte bancaire")}
                </button>
                <button
                  type="button"
                  className={method === "cash" ? "active" : ""}
                  aria-pressed={method === "cash"}
                  onClick={() => setMethod("cash")}
                >
                  <Banknote size={24} />
                  {t("Espèces")}
                </button>
              </div>
            </fieldset>
            {method === "cash" ? (
              <div className="cash-fields">
                <label htmlFor="received">{t("Montant reçu (CHF)")}</label>
                <input
                  id="received"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={money(0)}
                  value={received}
                  onChange={(e) => setReceived(e.target.value)}
                />
                <div className="quick-amounts">
                  {[
                    ...new Set(
                      [total, 2000, 5000, 10000].filter((v) => v >= total),
                    ),
                  ].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setReceived((v / 100).toFixed(2))}
                    >
                      {v === total ? t("Exact") : `${money(v)} CHF`}
                    </button>
                  ))}
                </div>
                <div className="change-row">
                  <span>{t("Monnaie à rendre")}</span>
                  <strong>
                    {money(Math.max(0, receivedCents - total))} CHF
                  </strong>
                </div>
                {received && !canPay && (
                  <p className="field-error">
                    {t("Saisissez un montant valide couvrant le total.")}
                  </p>
                )}
              </div>
            ) : (
              <p className="card-instruction">
                {t(
                  "Effectuez le paiement sur votre terminal bancaire, puis confirmez ici. Aucun débit n’est effectué par l’application.",
                )}
              </p>
            )}
            {error && (
              <p className="field-error" role="alert">
                {t(error)}
              </p>
            )}
            <button type="submit" className="primary-button" disabled={!canPay}>
              <Check size={20} />
              {method === "card"
                ? t("Confirmer le paiement reçu")
                : t("Valider le paiement")}
            </button>
            <button
              type="button"
              className="back-button"
              onClick={() => setModal(null)}
            >
              <ArrowLeft size={16} />
              {t("Revenir à la commande")}
            </button>
          </form>
        )}
        {modal === "clear" && (
          <div>
            <p className="dialog-copy">
              {formatCount(language, "items", count)}.{" "}
              {t("Les articles seront retirés de la commande en cours.")}
            </p>
            <div className="dialog-actions">
              <button
                className="secondary-button"
                onClick={() => setModal(null)}
              >
                {t("Conserver")}
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  if (save({ ...data, cart: {} })) setModal(null);
                }}
              >
                {t("Vider la commande")}
              </button>
            </div>
          </div>
        )}
        {modal === "history" && (
          <div>
            <div className="history-summary">
              <span>{formatCount(language, "sales", data.sales.length)}</span>
              <button
                className="secondary-button"
                disabled={!data.sales.length}
                onClick={exportSales}
              >
                <Download size={16} />
                {t("Exporter")}
              </button>
            </div>
            {data.sales.length ? (
              <div className="sales-list">
                {data.sales.map((s) => (
                  <details key={s.id}>
                    <summary>
                      <span className="sale-icon">
                        {s.method === "cash" ? (
                          <Banknote size={21} />
                        ) : (
                          <CreditCard size={21} />
                        )}
                      </span>
                      <span>
                        <strong>
                          {new Date(s.date).toLocaleDateString(
                            locales[language],
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </strong>
                        <small>
                          {new Date(s.date).toLocaleTimeString(
                            locales[language],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                          ,{" "}
                          {s.method === "cash"
                            ? t("Espèces")
                            : t("Carte bancaire")}
                        </small>
                      </span>
                      <b>{money(s.total)} CHF</b>
                      <ChevronRight size={16} />
                    </summary>
                    <div className="sale-details">
                      {s.items.map((p, i) => (
                        <div key={`${p.id}-${i}`}>
                          <span>
                            {p.quantity} × {name(p)}
                          </span>
                          <span>{money(p.price * p.quantity)} CHF</span>
                        </div>
                      ))}
                      {s.method === "cash" && (
                        <>
                          <div>
                            <span>{t("Montant reçu")}</span>
                            <span>{money(s.received)} CHF</span>
                          </div>
                          <div>
                            <span>{t("Monnaie rendue")}</span>
                            <span>{money(s.change)} CHF</span>
                          </div>
                        </>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <div className="history-empty">
                <ReceiptText size={35} />
                <h3>{t("Le service commence ici")}</h3>
                <p>{t("Vos commandes encaissées apparaîtront ici.")}</p>
              </div>
            )}
            <p className="local-note">
              {t(
                "Données conservées dans ce navigateur. Exportez vos ventes pour les sauvegarder.",
              )}
            </p>
          </div>
        )}
        {modal === "about" && (
          <div className="about-copy">
            <span className="brand-icon">
              <Martini size={24} />
            </span>
            <h3>CashFlow</h3>
            <p>
              {t(
                "La caisse pensée pour votre bar. Commandes, encaissements et historique, au même endroit.",
              )}
            </p>
            <p>
              {t(
                "Les données sont stockées uniquement sur cet appareil, dans ce navigateur. Aucun compte ni serveur n’est nécessaire.",
              )}
            </p>
            <p>
              {t("Photographies :")}{" "}
              <a
                href="https://www.thecocktaildb.com"
                target="_blank"
                rel="noreferrer"
              >
                TheCocktailDB
              </a>{" "}
              {t("et Wikimedia Commons. Les visuels sont illustratifs.")}
            </p>
            <a href="/images/credits.json" target="_blank" rel="noreferrer">
              {t("Crédits des images")}
            </a>
          </div>
        )}
      </dialog>
    </div>
  );
}

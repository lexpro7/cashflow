# CashFlow — POS pour bar à cocktails

Application React, TypeScript et Tailwind CSS. Aucun serveur ni compte requis.

## Développement

```sh
npm install
npm run dev
```

## Production / Vercel

```sh
npm run build
```

Importez le dépôt dans Vercel, sélectionnez **Vite**, commande de compilation `npm run build`, répertoire de sortie `dist`. Aucune variable d’environnement. `npm run preview` sert la compilation localement.

## Tests

Avec Node.js 22.18 ou supérieur : `npm test`. Les tests couvrent le catalogue local, les centimes, la restauration des données, les paiements, la monnaie, l’historique et les erreurs de stockage.

## Fonctionnalités

- 16 produits, catégories et recherche insensible aux accents.
- Panier persistant, quantités, suppression et confirmation avant vidage.
- Encaissement par carte (confirmation manuelle d’un terminal externe) ou espèces, calcul de monnaie en centimes.
- Historique détaillé des ventes, export JSON, thèmes clair/sombre, plein écran et disposition mobile/tablette.
- Interface intégralement disponible en français, anglais et russe via le sélecteur FR / EN / RU. Le français est utilisé par défaut ; le choix est conservé dans localStorage (`cashflow-language`). Les produits et ventes restent inchangés lors d’un changement de langue.
- Photographies incluses dans `public/images`, sans requêtes externes au chargement.

Les données sont enregistrées dans le localStorage de ce navigateur sous `cashflow-pos-v1`. Elles ne sont pas partagées entre appareils et sont perdues si le stockage du site est effacé. Exportez régulièrement l’historique. Utilisez un seul onglet de caisse à la fois. Un échec de sauvegarde bloque la validation du paiement pour conserver le panier.

Les prix sont exprimés en CHF. Aucun calcul de TVA n’est ajouté. L’application n’effectue aucun débit bancaire et ne remplace pas un terminal de paiement.

## Images

Sources et crédits dans `public/images/credits.json`. Les photos illustrent les produits, sans représenter une recette ou une présentation contractuelle. Le visuel Vodka Red Bull est un long drink illustratif. `scripts/download-images.mjs` permet de télécharger de nouveau les sources (connexion requise).

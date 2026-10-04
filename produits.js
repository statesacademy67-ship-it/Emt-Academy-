/* Adresse du serveur de paiement (voir dossier serveur). Laisser vide tant qu'il n'est pas en ligne : le bouton Acheter enverra alors un e-mail. */
const API_URL = "";

/* Liste des formations. Pour en ajouter : copier un bloc { ... }, modifier, et ajouter la virgule.
   affiche   : image placée à la racine
   lienAchat : lien de paiement (à renseigner) */
const PRODUITS = [
  {
    slug: "bourse",
    nom: "Comment investir en bourse depuis l'Afrique",
    description: "Formation complète de A à Z : comprendre la bourse, choisir un courtier, investir, gérer le risque et construire un portefeuille. Guide pratique, exercices et check-lists.",
    prix: "2 000 FCFA",
    affiche: "affiche-bourse.png",
    lienAchat: "mailto:emtacademy@protonmail.com?subject=Commande%20-%20Comment%20investir%20en%20bourse%20depuis%20l'Afrique"
  },
  {
    slug: "ecommerce",
    nom: "E-commerce en Afrique",
    description: "Formation complète de A à Z : choisir une niche, trouver des fournisseurs, créer sa boutique, encaisser, livrer, faire de la pub et développer ses ventes. Modèles et check-lists inclus.",
    prix: "1 200 FCFA",
    affiche: "affiche-ecommerce.jpg",
    lienAchat: "mailto:emtacademy@protonmail.com?subject=Commande%20-%20E-commerce%20en%20Afrique"
  },
  {
    slug: "trading",
    nom: "Trading Premium",
    description: "Formation complète de A à Z pour apprendre à trader : lire un graphique, analyser, gérer le risque, construire une stratégie et garder la discipline. Forex, crypto, indices, matières premières et actions.",
    prix: "3 500 FCFA",
    affiche: "affiche-trading.png",
    lienAchat: "mailto:emtacademy@protonmail.com?subject=Commande%20-%20Trading%20Premium"
  },
  {
    slug: "business",
    nom: "Vendre des produits digitaux (version 2026)",
    description: "Formation complète : trouver une idée rentable, créer ses produits digitaux, lancer sa boutique en ligne, trouver ses premiers clients, encaisser et développer son business en Afrique.",
    prix: "800 FCFA",
    affiche: "affiche-business.png",
    lienAchat: "mailto:emtacademy@protonmail.com?subject=Commande%20-%20Vendre%20des%20produits%20digitaux"
  }
];

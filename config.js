// =============================================================
// ALMANACH — Configuration par défaut
// Ces valeurs servent de point de départ : elles sont copiées dans
// Firebase au premier lancement, puis modifiables depuis Réglages.
// Vous n'avez normalement plus besoin d'éditer ce fichier ensuite.
// =============================================================

const CONFIG = {

  prenom: "Etienne",
  nomApp: "Almanach",

  // ── Marchés financiers ──────────────────────────────────────
  twelveDataApiKey: "",  // https://twelvedata.com/ → compte gratuit
  marches: [
    { symbole: "^FCHI", symboleTwelveData: "FCHI", nom: "CAC 40",  devise: "€" },
    { symbole: "^GSPC", symboleTwelveData: "SPX",  nom: "S&P 500", devise: "$" },
  ],

  // ── Progression Réveil / Soir (pompes + gainage) ────────────
  // Paliers mensuels à partir de la date de démarrage du programme.
  // Le mois 3 est un plafond : au-delà, les valeurs n'évoluent plus.
  paliersProgression: [
    { mois: 1, pompes: 20, gainageSec: 60 },
    { mois: 2, pompes: 25, gainageSec: 75 },
    { mois: 3, pompes: 30, gainageSec: 90 },
  ],

  // ── Contenu par défaut des routines (modifiable dans Réglages) ──
  reveilMusculaire: [
    "10 rotations d'épaules",
    "10 squats au poids du corps",
    "Étirement chat-vache, 5 respirations",
  ],
  circuitAbdosSoir: [
    "Montée de genou croisée (coude-genou) : 15/côté",
    "Flexion latérale du buste : 15/côté",
    "Torsion debout, bras tendus : 20 répétitions",
    "Montée de genoux dynamique : 30 secondes",
  ],

  // ── Types de séance par défaut (max 5, modifiable dans Réglages) ──
  typesSeance: [
    { id: "course", nom: "Course", couleur: "#3E6B8A" },
    { id: "muscu",  nom: "Muscu",  couleur: "#FF6B4A" },
    { id: "repos",  nom: "Repos",  couleur: "#4A5163" },
  ],

  // ── Planning hebdomadaire par défaut ─────────────────────────
  planningSemaine: {
    lundi:    "course",
    mardi:    "muscu",
    mercredi: "repos",
    jeudi:    "course",
    vendredi: "muscu",
    samedi:   "repos",
    dimanche: "repos",
  },

  // ── Petits-déjeuners par défaut (sans cuisine, rapides) ──────
  petitsDejeuners: {
    lundi:    "Pain de mie, beurre de cacahuète, banane — rapide, glucides + un peu de gras avant la course.",
    mardi:    "Yaourt grec, granola, fruits — zéro cuisson, protéiné pour la récup muscu.",
    mercredi: "Libre — jour de repos.",
    jeudi:    "Overnight oats préparés la veille (flocons + lait + miel au frigo) — prêt à sortir du frigo.",
    vendredi: "Fromage blanc, miel, amandes — 30 secondes de préparation, protéiné.",
    samedi:   "Libre — jour de repos.",
    dimanche: "Libre — jour de repos.",
  },

  // ── Réglages généraux par défaut ─────────────────────────────
  intentionDuJourActive: false,
  suiviSerieActive: true,
  codeAcces: "",  // laissez vide = pas de protection ; sinon un code simple à définir

  // ── Heures des rappels "si pas fait" (uniquement à l'ouverture) ──
  rappelReveilApres: 9,   // heure
  rappelSoirApres: 20,    // heure

};

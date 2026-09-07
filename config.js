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
  twelveDataApiKey: "7a29265938c34c17967caa52a4825ff1",  // https://twelvedata.com/ → compte gratuit
  // Les indices bruts (^FCHI, ^GSPC) sont réservés aux plans payants de Twelve Data.
  // On utilise donc des ETF qui répliquent ces indices, accessibles en plan gratuit :
  //  - CAC (Euronext Paris)  : Amundi CAC 40 UCITS ETF Dist, ~1/100e de la valeur du CAC 40
  //  - SPY (NYSE Arca)       : SPDR S&P 500 ETF Trust, ~1/10e de la valeur du S&P 500
  // Ce sont donc des valeurs approchées (mais fidèles en évolution %), pas les indices exacts.
  marches: [
    { symbole: "^FCHI", symboleTwelveData: "CAC", exchangeTwelveData: "Euronext", nom: "CAC 40 (ETF)",  devise: "€" },
    { symbole: "^GSPC", symboleTwelveData: "SPY", exchangeTwelveData: "NYSE",     nom: "S&P 500 (ETF)", devise: "$" },
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


// =============================================================
// PROGRAMME DE CALISTHÉNIE — 30 jours, 6 blocs progressifs de 5 jours
// ~15 min/jour, 3 séries, 30-45 sec de repos entre séries (sauf indication).
// Chaque jour appartient à un bloc (0 à 5) qui détermine la vidéo/illustration.
// =============================================================

const NOMS_BLOCS_CALISTHENIE = [
  "Fondations", "Intensification", "Diversification",
  "Renforcement ciblé", "Cardio calisthénique", "Consolidation",
];

const PROGRAMME_CALISTHENIE = [
  // ── Bloc 1 : Fondations (jours 1-5) ──────────────────────────
  { jour: 1,  bloc: 0, theme: "Full body", exercices: [
    "Squats : 3×12", "Pompes : 3×8", "Fentes alternées : 3×8/jambe", "Gainage : 3×20 sec"] },
  { jour: 2,  bloc: 0, theme: "Haut du corps", exercices: [
    "Pompes : 3×8", "Dips sur chaise : 3×8", "Superman : 3×10", "Gainage latéral : 2×15 sec/côté"] },
  { jour: 3,  bloc: 0, theme: "Bas du corps", exercices: [
    "Squats : 3×12", "Fentes arrière : 3×8/jambe", "Pont fessier : 3×12", "Chaise (contre un mur) : 2×20 sec"] },
  { jour: 4,  bloc: 0, theme: "Gainage / Core", exercices: [
    "Gainage : 3×25 sec", "Crunchs : 3×12", "Montée de genoux : 3×15", "Superman : 3×10"] },
  { jour: 5,  bloc: 0, theme: "Cardio léger", exercices: [
    "Jumping jacks : 3×20 sec", "Montée de genoux rapide : 3×15 sec", "Squats : 3×10", "Mountain climbers : 3×15"] },

  // ── Bloc 2 : Intensification (jours 6-10) ────────────────────
  { jour: 6,  bloc: 1, theme: "Full body", exercices: [
    "Squats : 3×15", "Pompes : 3×10", "Fentes alternées : 3×10/jambe", "Gainage : 3×30 sec"] },
  { jour: 7,  bloc: 1, theme: "Haut du corps", exercices: [
    "Pompes : 3×10", "Dips sur chaise : 3×10", "Superman : 3×12", "Gainage latéral : 3×20 sec/côté"] },
  { jour: 8,  bloc: 1, theme: "Bas du corps", exercices: [
    "Squats : 4×15", "Fentes arrière : 3×10/jambe", "Pont fessier : 3×15", "Chaise : 3×25 sec"] },
  { jour: 9,  bloc: 1, theme: "Gainage / Core", exercices: [
    "Gainage : 3×35 sec", "Crunchs : 3×15", "Montée de genoux : 3×20", "Superman : 3×12"] },
  { jour: 10, bloc: 1, theme: "Cardio léger", exercices: [
    "Jumping jacks : 3×30 sec", "Montée de genoux rapide : 3×20 sec", "Squats sautés : 3×8", "Mountain climbers : 3×20"] },

  // ── Bloc 3 : Diversification (jours 11-15) ───────────────────
  { jour: 11, bloc: 2, theme: "Full body avancé", exercices: [
    "Pompes pieds surélevés : 3×8", "Squats sumo : 3×12", "Fentes marchées : 3×10/jambe", "Gainage : 3×35 sec"] },
  { jour: 12, bloc: 2, theme: "Haut du corps +", exercices: [
    "Pompes diamant : 3×8", "Dips sur chaise : 3×12", "Pompes archer assistées : 2×5/côté", "Gainage latéral : 3×25 sec/côté"] },
  { jour: 13, bloc: 2, theme: "Bas du corps +", exercices: [
    "Squats bulgares (chaise) : 3×8/jambe", "Fentes latérales : 3×10/jambe", "Pont fessier unijambiste : 3×8/jambe", "Mollets : 3×20"] },
  { jour: 14, bloc: 2, theme: "Gainage avancé", exercices: [
    "Gainage + levée de jambe : 3×30 sec", "Crunchs bicyclette : 3×15", "Gainage inversé (dos) : 3×20 sec", "Superman : 3×15"] },
  { jour: 15, bloc: 2, theme: "Cardio +", exercices: [
    "Burpees : 3×6", "Jumping jacks : 3×30 sec", "Mountain climbers : 3×25", "Squats sautés : 3×10"] },

  // ── Bloc 4 : Renforcement ciblé (jours 16-20) ────────────────
  { jour: 16, bloc: 3, theme: "Haut du corps intense", exercices: [
    "Pompes : 4×12", "Dips sur chaise : 4×12", "Pompes diamant : 3×10", "Gainage : 3×40 sec"] },
  { jour: 17, bloc: 3, theme: "Bas du corps intense", exercices: [
    "Squats : 4×18", "Fentes marchées : 4×12/jambe", "Pont fessier : 4×15", "Chaise : 3×30 sec"] },
  { jour: 18, bloc: 3, theme: "Full body intense", exercices: [
    "Burpees : 3×8", "Pompes : 3×12", "Squats : 3×18", "Gainage : 3×40 sec"] },
  { jour: 19, bloc: 3, theme: "Core intense", exercices: [
    "Gainage + levée de jambe : 3×35 sec", "Crunchs bicyclette : 3×20", "Superman : 3×15", "Gainage latéral : 3×30 sec/côté"] },
  { jour: 20, bloc: 3, theme: "Cardio intense", exercices: [
    "Burpees : 4×8", "Mountain climbers : 4×25", "Squats sautés : 4×10", "Jumping jacks : 4×30 sec"] },

  // ── Bloc 5 : Cardio calisthénique (jours 21-25) — repos réduit ──
  { jour: 21, bloc: 4, theme: "Circuit express", exercices: [
    "Jumping jacks : 4×30 sec", "Squats sautés : 4×12", "Mountain climbers : 4×25", "Burpees : 3×8", "(20 sec de repos entre séries)"] },
  { jour: 22, bloc: 4, theme: "Circuit haut du corps", exercices: [
    "Pompes : 4×12", "Dips sur chaise : 4×12", "Pompes tapées (avancé) : 2×5", "Gainage : 3×40 sec"] },
  { jour: 23, bloc: 4, theme: "Circuit bas du corps", exercices: [
    "Squats sautés : 4×12", "Fentes sautées : 3×10/jambe", "Pont fessier dynamique : 4×15", "Chaise : 3×35 sec"] },
  { jour: 24, bloc: 4, theme: "Circuit full body", exercices: [
    "Burpees : 4×10", "Pompes : 4×12", "Squats : 4×18", "Mountain climbers : 4×30"] },
  { jour: 25, bloc: 4, theme: "HIIT léger", exercices: [
    "8 tours de 30 sec effort / 15 sec repos, en alternant :", "Jumping jacks → Squats → Pompes → Montée de genoux"] },

  // ── Bloc 6 : Consolidation (jours 26-30) ─────────────────────
  { jour: 26, bloc: 5, theme: "Full body avancé", exercices: [
    "Pompes pieds surélevés : 4×10", "Squats bulgares : 3×10/jambe", "Burpees : 3×10", "Gainage : 3×45 sec"] },
  { jour: 27, bloc: 5, theme: "Haut du corps avancé", exercices: [
    "Pompes diamant : 4×10", "Dips sur chaise : 4×15", "Pompes archer : 3×6/côté", "Gainage latéral : 3×30 sec/côté"] },
  { jour: 28, bloc: 5, theme: "Bas du corps avancé", exercices: [
    "Squats sumo : 4×18", "Fentes marchées : 4×15/jambe", "Pont fessier unijambiste : 4×10/jambe", "Chaise : 3×40 sec"] },
  { jour: 29, bloc: 5, theme: "Core avancé", exercices: [
    "Gainage + levée de jambe : 4×35 sec", "Crunchs bicyclette : 4×20", "Gainage inversé : 3×25 sec", "Superman : 4×15"] },
  { jour: 30, bloc: 5, theme: "Bilan & étirements", exercices: [
    "Reprenez votre exercice préféré du programme, 3 séries", "Puis 10 min d'étirements complets (ischios, quadriceps, épaules, dos, pectoraux)"] },
];

// Une vidéo d'ancrage par bloc (technique de base, trouvée en ligne)
const VIDEOS_CALISTHENIE_PAR_BLOC = [
  { url: "https://www.youtube.com/watch?v=t-I28JRPEag", label: "Bien exécuter ses pompes" },        // Bloc 0 Fondations
  { url: "https://www.youtube.com/watch?v=_YHkhPaXyZc", label: "Bien tenir la planche (gainage)" }, // Bloc 1 Intensification
  { url: "https://www.youtube.com/watch?v=BA-1aTlZRKk", label: "Dips sur chaise, la bonne technique" }, // Bloc 2 Diversification
  { url: "https://www.youtube.com/watch?v=t-I28JRPEag", label: "Pompes : retour sur la technique" },  // Bloc 3 Renforcement
  { url: "https://www.youtube.com/watch?v=FKKh6pXAggM", label: "Bien exécuter le burpee" },          // Bloc 4 Cardio
  { url: "https://www.youtube.com/watch?v=8JqOy80iH7o", label: "Étirements complets 10 minutes" },   // Bloc 5 Consolidation
];

// Illustration simple par bloc (SVG, style cohérent avec le reste de l'app —
// silhouette stylisée, pas de photo, pour rester léger et sans souci de droits).
const ILLUSTRATIONS_CALISTHENIE_PAR_BLOC = [
  // Bloc 0 : Fondations — silhouette en position debout, neutre
  `<svg width="120" height="140" viewBox="0 0 120 140" fill="none">
    <circle cx="60" cy="24" r="14" fill="#1E2430"/>
    <path d="M60 38 L60 85" stroke="#1E2430" stroke-width="9" stroke-linecap="round"/>
    <path d="M60 48 L35 65 M60 48 L85 65" stroke="#6E8F6B" stroke-width="8" stroke-linecap="round"/>
    <path d="M60 85 L42 130 M60 85 L78 130" stroke="#1E2430" stroke-width="9" stroke-linecap="round"/>
  </svg>`,
  // Bloc 1 : Intensification — silhouette en mouvement dynamique
  `<svg width="120" height="140" viewBox="0 0 120 140" fill="none">
    <circle cx="55" cy="22" r="14" fill="#1E2430"/>
    <path d="M55 36 L65 80" stroke="#1E2430" stroke-width="9" stroke-linecap="round"/>
    <path d="M60 45 L30 30 M60 45 L90 60" stroke="#FF6B4A" stroke-width="8" stroke-linecap="round"/>
    <path d="M65 80 L40 110 M65 80 L95 120" stroke="#1E2430" stroke-width="9" stroke-linecap="round"/>
  </svg>`,
  // Bloc 2 : Diversification — silhouette position dip / bras fléchis
  `<svg width="120" height="140" viewBox="0 0 120 140" fill="none">
    <circle cx="60" cy="30" r="14" fill="#1E2430"/>
    <path d="M60 44 L60 75" stroke="#1E2430" stroke-width="9" stroke-linecap="round"/>
    <path d="M60 50 L38 45 M60 50 L82 45" stroke="#8A6BAF" stroke-width="8" stroke-linecap="round"/>
    <path d="M60 75 L45 100 L45 130 M60 75 L75 100 L75 130" stroke="#1E2430" stroke-width="9" stroke-linecap="round"/>
  </svg>`,
  // Bloc 3 : Renforcement ciblé — silhouette pose forte, bras croisés/fermes
  `<svg width="120" height="140" viewBox="0 0 120 140" fill="none">
    <circle cx="60" cy="22" r="14" fill="#1E2430"/>
    <path d="M60 36 L60 82" stroke="#1E2430" stroke-width="10" stroke-linecap="round"/>
    <path d="M60 46 L32 38 M60 46 L88 38" stroke="#C98A3E" stroke-width="9" stroke-linecap="round"/>
    <path d="M60 82 L40 130 M60 82 L80 130" stroke="#1E2430" stroke-width="10" stroke-linecap="round"/>
  </svg>`,
  // Bloc 4 : Cardio calisthénique — silhouette en saut (jumping jack)
  `<svg width="120" height="140" viewBox="0 0 120 140" fill="none">
    <circle cx="60" cy="24" r="14" fill="#1E2430"/>
    <path d="M60 38 L60 80" stroke="#1E2430" stroke-width="9" stroke-linecap="round"/>
    <path d="M60 44 L25 20 M60 44 L95 20" stroke="#FF6B4A" stroke-width="8" stroke-linecap="round"/>
    <path d="M60 80 L30 128 M60 80 L90 128" stroke="#1E2430" stroke-width="9" stroke-linecap="round"/>
  </svg>`,
  // Bloc 5 : Consolidation — silhouette en étirement, bras levés
  `<svg width="120" height="140" viewBox="0 0 120 140" fill="none">
    <circle cx="60" cy="26" r="14" fill="#1E2430"/>
    <path d="M60 40 L60 85" stroke="#1E2430" stroke-width="9" stroke-linecap="round"/>
    <path d="M60 48 L40 10 M60 48 L80 10" stroke="#3EAFA0" stroke-width="8" stroke-linecap="round"/>
    <path d="M60 85 L45 130 M60 85 L75 130" stroke="#1E2430" stroke-width="9" stroke-linecap="round"/>
  </svg>`,
];

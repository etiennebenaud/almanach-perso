// =============================================================
// CONTENUS — Citations locales (fiables, aucune dépendance API)
// Une citation différente chaque jour, calculée automatiquement
// à partir du jour de l'année. Vous pouvez enrichir ces listes
// librement, l'app s'adapte à leur longueur.
// =============================================================

const CITATIONS_MOTIVATION = [
  { texte: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", auteur: "Sénèque" },
  { texte: "La discipline est le pont entre les objectifs et les accomplissements.", auteur: "Jim Rohn" },
  { texte: "Le succès, c'est se déplacer d'échec en échec sans perdre son enthousiasme.", auteur: "Winston Churchill" },
  { texte: "On ne change pas ses habitudes, on en construit de nouvelles jusqu'à ce qu'elles remplacent les anciennes.", auteur: "Anonyme" },
  { texte: "La motivation, c'est ce qui vous fait démarrer. L'habitude, c'est ce qui vous fait continuer.", auteur: "Jim Ryun" },
  { texte: "Chaque jour est une nouvelle occasion de changer sa vie.", auteur: "Anonyme" },
  { texte: "Il n'y a pas d'ascenseur pour la réussite, il faut prendre l'escalier.", auteur: "Anonyme" },
  { texte: "Le corps atteint ce que l'esprit croit.", auteur: "Anonyme" },
  { texte: "Ne compte pas les jours, fais que les jours comptent.", auteur: "Mohammed Ali" },
  { texte: "La douleur que tu ressens aujourd'hui sera la force que tu sentiras demain.", auteur: "Anonyme" },
  { texte: "Un voyage de mille lieues commence toujours par un premier pas.", auteur: "Lao Tseu" },
  { texte: "Ce qui ne me tue pas me rend plus fort.", auteur: "Friedrich Nietzsche" },
  { texte: "Le seul mauvais entraînement est celui que tu n'as pas fait.", auteur: "Anonyme" },
  { texte: "Devenir meilleur qu'hier, voilà le seul adversaire qui compte.", auteur: "Anonyme" },
  { texte: "L'important n'est pas la victoire mais le combat.", auteur: "Pierre de Coubertin" },
  { texte: "Fixe-toi des objectifs si grands que tu ne pourras les atteindre qu'en devenant une meilleure personne.", auteur: "Jim Rohn" },
  { texte: "La constance paie toujours, à long terme.", auteur: "Anonyme" },
  { texte: "Tu n'as pas besoin d'être extrême, juste constant.", auteur: "Anonyme" },
  { texte: "Chaque expert a un jour été débutant.", auteur: "Helen Hayes" },
  { texte: "La seule limite à notre épanouissement de demain sera nos doutes d'aujourd'hui.", auteur: "Franklin D. Roosevelt" },
  { texte: "Les grandes choses ne sont jamais faites par une seule action, mais par une somme de petites choses rassemblées.", auteur: "Vincent van Gogh" },
  { texte: "On ne construit pas sa vie avec des intentions, mais avec des actions.", auteur: "Anonyme" },
  { texte: "Sois si bon qu'on ne puisse pas t'ignorer.", auteur: "Steve Martin" },
  { texte: "Le futur appartient à ceux qui croient en la beauté de leurs rêves.", auteur: "Eleanor Roosevelt" },
  { texte: "Il vaut mieux tenter sa chance que regretter de ne pas avoir essayé.", auteur: "Anonyme" },
  { texte: "La persévérance est la clé de voûte de tous les triomphes.", auteur: "Anonyme" },
  { texte: "Ce que tu fais aujourd'hui peut améliorer tous tes lendemains.", auteur: "Ralph Marston" },
  { texte: "Le plus dur, c'est de commencer. Après, ça devient une habitude.", auteur: "Anonyme" },
  { texte: "L'excellence n'est pas un acte, mais une habitude.", auteur: "Aristote" },
  { texte: "Fais de ta vie un rêve, et d'un rêve, une réalité.", auteur: "Antoine de Saint-Exupéry" },
];

const CITATIONS_BIEN_ETRE = [
  { texte: "La respiration est le pont qui relie la vie à la conscience.", auteur: "Thich Nhat Hanh" },
  { texte: "Le calme n'est pas l'absence de tempête, mais la paix au milieu de celle-ci.", auteur: "Anonyme" },
  { texte: "Prends soin de ton corps, c'est le seul endroit où tu es obligé de vivre.", auteur: "Jim Rohn" },
  { texte: "La santé n'est pas tout, mais sans elle, tout le reste n'est rien.", auteur: "Arthur Schopenhauer" },
  { texte: "Un esprit sain dans un corps sain.", auteur: "Juvénal" },
  { texte: "Le silence est une source de grande force.", auteur: "Lao Tseu" },
  { texte: "Aujourd'hui, choisis la joie.", auteur: "Anonyme" },
  { texte: "Ralentir, ce n'est pas perdre du temps, c'est en gagner sur l'essentiel.", auteur: "Anonyme" },
  { texte: "Le bonheur n'est pas une destination, c'est une façon de voyager.", auteur: "Margaret Lee Runbeck" },
  { texte: "Dors bien, ris souvent, aime beaucoup.", auteur: "Anonyme" },
  { texte: "La gratitude transforme ce que l'on a en suffisance.", auteur: "Anonyme" },
  { texte: "Prendre soin de soi n'est pas égoïste, c'est essentiel.", auteur: "Anonyme" },
  { texte: "Chaque respiration est une nouvelle chance de recommencer.", auteur: "Anonyme" },
  { texte: "Le repos n'est pas une perte de temps, c'est un investissement.", auteur: "Anonyme" },
  { texte: "La paix vient de l'intérieur, ne la cherche pas à l'extérieur.", auteur: "Bouddha" },
  { texte: "Bois de l'eau, respire profondément, et tout ira bien.", auteur: "Anonyme" },
  { texte: "Un corps détendu est un esprit qui s'apaise.", auteur: "Anonyme" },
  { texte: "La lenteur est la politesse des racines.", auteur: "Christian Bobin" },
  { texte: "Manger est un acte d'amour envers soi-même.", auteur: "Anonyme" },
  { texte: "Le sommeil est le meilleur médicament.", auteur: "Proverbe irlandais" },
  { texte: "La nature ne se presse jamais, et pourtant tout s'accomplit.", auteur: "Lao Tseu" },
  { texte: "Sois doux avec toi-même, tu fais de ton mieux.", auteur: "Anonyme" },
  { texte: "L'équilibre n'est pas quelque chose que tu trouves, c'est quelque chose que tu crées.", auteur: "Anonyme" },
  { texte: "Un moment de calme vaut mieux qu'une heure d'agitation.", auteur: "Anonyme" },
  { texte: "Le meilleur moment pour respirer profondément, c'est maintenant.", auteur: "Anonyme" },
  { texte: "Prends le temps de ne rien faire, c'est souvent là que tout se répare.", auteur: "Anonyme" },
  { texte: "La joie que l'on donne revient toujours.", auteur: "Victor Hugo" },
  { texte: "S'écouter, c'est déjà se soigner.", auteur: "Anonyme" },
  { texte: "Une bonne journée commence par une bonne nuit.", auteur: "Anonyme" },
  { texte: "Le vrai luxe, c'est le temps pour soi.", auteur: "Anonyme" },
];

const CITATIONS_REPOS = [
  { texte: "Le repos fait partie de l'entraînement, pas une pause dedans.", auteur: "Anonyme" },
  { texte: "Se reposer n'est pas abandonner, c'est se préparer à repartir plus fort.", auteur: "Anonyme" },
  { texte: "Même la terre a besoin de son hiver pour donner ses fruits au printemps.", auteur: "Anonyme" },
  { texte: "La récupération est l'entraînement invisible.", auteur: "Anonyme" },
  { texte: "Un corps reposé est un corps prêt à progresser.", auteur: "Anonyme" },
  { texte: "Ralentir aujourd'hui, c'est avancer plus loin demain.", auteur: "Anonyme" },
  { texte: "Le muscle se construit au repos, pas seulement à l'effort.", auteur: "Anonyme" },
  { texte: "Écouter son corps, c'est déjà s'entraîner intelligemment.", auteur: "Anonyme" },
  { texte: "La patience est aussi une forme de discipline.", auteur: "Anonyme" },
  { texte: "Un jour de repos bien pris vaut deux séances mal récupérées.", auteur: "Anonyme" },
];

// ── Sélection du jour : rotation stable basée sur le jour de l'année ──
function jourDeLAnnee(date) {
  const debut = new Date(date.getFullYear(), 0, 0);
  const diff = date - debut;
  return Math.floor(diff / 86400000);
}

function citationDuJour(liste, date) {
  const idx = jourDeLAnnee(date) % liste.length;
  return liste[idx];
}

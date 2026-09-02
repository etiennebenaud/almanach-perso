// =============================================================
// ALMANACH — app.js — logique complète
// =============================================================

const JOURS_SEMAINE    = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
const JOURS_AFFICHAGE  = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
const MOIS_AFFICHAGE   = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

// État global de l'app, chargé depuis Firestore (avec repli sur CONFIG par défaut)
const ETAT = {
  planningSemaine: null,
  typesSeance: null,
  reveilMusculaire: null,
  circuitAbdosSoir: null,
  petitsDejeuners: null,
  intentionDuJourActive: null,
  suiviSerieActive: null,
  dateDebutProgramme: null,
  recordGainage: '',
  videos: { liste: [], actifId: null },
  journalDuJour: {},   // { reveilFait, soirFait, seanceFaite, intentionTexte }
  chronoInterval: null,
  chronoSecondesRestantes: 60,
};

function cleDuJour(date = new Date()) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// ── Démarrage ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initFirebase();
  await chargerEtatDepuisFirestore();
  await chargerJournalDuJour();

  afficherEntete();
  afficherCitations();
  afficherRoutine('reveil');
  afficherRoutine('soir');
  afficherSeanceDuJour();
  afficherPetitDej();
  afficherRappelSiPasFait();
  afficherBilanDimanche();
  afficherIntentionDuJour();
  chargerAnecdote();
  chargerMarches();
  scrollSelonHeure();
  verifierMotivationAutomatique();
});

// ── Motivation automatique : 1 fois le matin, 1 fois le soir ────
// (pas à chaque ouverture — juste la première fois sur chaque période)
function verifierMotivationAutomatique() {
  const heure = new Date().getHours();
  const periode = heure < 18 ? 'matin' : 'soir';
  const cleStockage = `almanach_motiv_${cleDuJour()}_${periode}`;

  let dejaVu = false;
  try { dejaVu = localStorage.getItem(cleStockage) === '1'; } catch (e) { /* localStorage indispo */ }
  if (dejaVu) return;

  setTimeout(() => {
    const titre = document.getElementById('motivation-titre');
    const contenu = document.getElementById('motivation-contenu');
    titre.textContent = periode === 'matin' ? '☀️ Pour bien commencer la journée' : '🌙 Un dernier mot avant ce soir';
    contenu.innerHTML = `<p class="motivation-fait">💡 ${bienfaitDuMoment(periode)}</p>`;
    document.getElementById('modal-motivation').style.display = 'flex';
    try { localStorage.setItem(cleStockage, '1'); } catch (e) { /* silencieux */ }
  }, 600);
}

// ── Ouverture par défaut : en haut le matin, sur "Soir" le soir ──
function scrollSelonHeure() {
  const heure = new Date().getHours();
  if (heure >= 18) {
    setTimeout(() => {
      const cible = document.getElementById('carte-soir');
      if (cible) cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }
}

// ── Chargement / initialisation Firestore ───────────────────
async function chargerEtatDepuisFirestore() {
  const defaut = {
    planningSemaine:     CONFIG.planningSemaine,
    typesSeance:         CONFIG.typesSeance,
    reveilMusculaire:    CONFIG.reveilMusculaire,
    circuitAbdosSoir:    CONFIG.circuitAbdosSoir,
    petitsDejeuners:     CONFIG.petitsDejeuners,
    intentionDuJourActive: CONFIG.intentionDuJourActive,
    suiviSerieActive:    CONFIG.suiviSerieActive,
    dateDebutProgramme:  cleDuJour(),
    recordGainage:       '',
    joursActifsReveil:   { lundi:true, mardi:true, mercredi:true, jeudi:true, vendredi:true, samedi:true, dimanche:true },
    joursActifsSoir:     { lundi:true, mardi:true, mercredi:true, jeudi:true, vendredi:true, samedi:true, dimanche:true },
  };

  if (!db) { Object.assign(ETAT, defaut); return; }

  try {
    const snap = await db.collection('etat').doc('config').get();
    if (snap.exists) {
      Object.assign(ETAT, defaut, snap.data());
    } else {
      Object.assign(ETAT, defaut);
      await db.collection('etat').doc('config').set(defaut);
    }
  } catch (e) {
    console.warn('Firestore config indisponible, valeurs par défaut utilisées.', e);
    Object.assign(ETAT, defaut);
  }

  // Vidéos
  if (db) {
    try {
      const snapVid = await db.collection('etat').doc('videos').get();
      if (snapVid.exists) {
        ETAT.videos = snapVid.data();
      } else {
        ETAT.videos = { liste: [], actifId: null };
        await db.collection('etat').doc('videos').set(ETAT.videos);
      }
    } catch (e) { console.warn('Vidéos indisponibles', e); }
  }
}

async function sauverEtat(champs) {
  Object.assign(ETAT, champs);
  if (!db) return;
  try {
    await db.collection('etat').doc('config').set(champs, { merge: true });
  } catch (e) { console.warn('Sauvegarde impossible', e); }
}

async function chargerJournalDuJour() {
  ETAT.journalDuJour = { reveilFait: false, soirFait: false, seanceFaite: false, intentionTexte: '' };
  if (!db) return;
  try {
    const snap = await db.collection('journal').doc(cleDuJour()).get();
    if (snap.exists) ETAT.journalDuJour = { ...ETAT.journalDuJour, ...snap.data() };
  } catch (e) { console.warn('Journal du jour indisponible', e); }
}

async function sauverJournalDuJour(champs) {
  Object.assign(ETAT.journalDuJour, champs);
  if (!db) return;
  try {
    await db.collection('journal').doc(cleDuJour()).set(ETAT.journalDuJour, { merge: true });
  } catch (e) { console.warn('Sauvegarde journal impossible', e); }
}

// ── En-tête ──────────────────────────────────────────────────
function afficherEntete() {
  const maintenant = new Date();
  const jourNom = JOURS_AFFICHAGE[maintenant.getDay()];
  document.getElementById('date-jour').textContent = `${jourNom.toUpperCase()} ${maintenant.getDate()} ${MOIS_AFFICHAGE[maintenant.getMonth()].toUpperCase()}`;

  const heure = maintenant.getHours();
  let salutation = "Bonsoir", icone = "🌙";
  if (heure < 6)       { salutation = "Debout tôt";      icone = "🌙"; }
  else if (heure < 12) { salutation = "Bonjour";          icone = "☀️"; }
  else if (heure < 18) { salutation = "Bon après-midi";   icone = "🌤️"; }
  document.getElementById('salutation').textContent = `${salutation}, ${CONFIG.prenom}`;
  document.getElementById('icone-moment').textContent = icone;

  if (ETAT.suiviSerieActive) {
    afficherStreak();
  }
}

async function afficherStreak() {
  const badge = document.getElementById('streak-badge');
  const n = await calculerStreak();
  badge.textContent = `🔥 ${n} séance${n > 1 ? 's' : ''}`;
  badge.style.display = 'inline-block';
}

// Compte les jours de séance sportive programmée (type ≠ repos) validés
// consécutivement, en remontant dans le temps (limité à 90 jours en arrière).
async function calculerStreak() {
  if (!db) return 0;

  // On récupère d'un coup (en parallèle) les 90 derniers jours, puis on
  // calcule le streak en mémoire — plutôt que 90 appels Firestore un par un.
  const jours = [];
  const curseurInit = new Date();
  curseurInit.setDate(curseurInit.getDate() - 1); // hier et avant (aujourd'hui traité à part)
  for (let i = 0; i < 90; i++) {
    jours.push(new Date(curseurInit));
    curseurInit.setDate(curseurInit.getDate() - 1);
  }

  const resultats = await Promise.all(jours.map(async date => {
    const type = typeDuJour(date);
    if (type === 'repos') return { repos: true, fait: false };
    try {
      const snap = await db.collection('journal').doc(cleDuJour(date)).get();
      return { repos: false, fait: snap.exists && snap.data().seanceFaite === true };
    } catch (e) {
      return { repos: false, fait: false };
    }
  }));

  let streak = 0;
  const typeAuj = typeDuJour();
  if (typeAuj !== 'repos' && ETAT.journalDuJour.seanceFaite) streak++;

  for (const r of resultats) {
    if (r.repos) continue;      // jour de repos : ne casse pas le streak, ne le monte pas
    if (r.fait) streak++;
    else break;                  // rupture du streak
  }
  return streak;
}

function typeDuJour(date = new Date()) {
  const jourKey = JOURS_SEMAINE[date.getDay()];
  return ETAT.planningSemaine[jourKey] || 'repos';
}

// ── Citations (motivation + bien-être), variante repos ──────
function afficherCitations() {
  const auj = new Date();
  const estRepos = typeDuJour(auj) === 'repos';

  const poolMotiv = estRepos ? CITATIONS_REPOS : CITATIONS_MOTIVATION;
  const motiv = citationDuJour(poolMotiv, auj);
  const bien  = citationDuJour(CITATIONS_BIEN_ETRE, auj);

  document.getElementById('citation-motiv-texte').textContent = `« ${motiv.texte} »`;
  document.getElementById('citation-motiv-auteur').textContent = `— ${motiv.auteur}`;
  document.getElementById('citation-bien-texte').textContent = `« ${bien.texte} »`;
  document.getElementById('citation-bien-auteur').textContent = `— ${bien.auteur}`;
}

// ── Calcul du mois de progression ───────────────────────────
// Calcule le palier automatique (mois 1/2/3) sans tenir compte d'un override
function palierAutomatique() {
  const debut = new Date(ETAT.dateDebutProgramme);
  const maintenant = new Date();
  const moisEcoules = (maintenant.getFullYear() - debut.getFullYear()) * 12
                     + (maintenant.getMonth() - debut.getMonth()) + 1;
  const palier = Math.min(Math.max(moisEcoules, 1), CONFIG.paliersProgression.length);
  return CONFIG.paliersProgression.find(p => p.mois === palier) || CONFIG.paliersProgression[0];
}

// Ancien nom conservé pour compatibilité (utilisé par le chrono par défaut)
function moisProgressionActuel() { return palierAutomatique(); }

// Palier effectif pour une routine donnée : l'override manuel s'il existe,
// sinon la progression automatique par mois.
function palierPourRoutine(cle) {
  const champOverride = cle === 'reveil' ? 'overrideReveil' : 'overrideSoir';
  const override = ETAT[champOverride];
  if (override && override.pompes != null && override.gainageSec != null) {
    return { mois: null, pompes: override.pompes, gainageSec: override.gainageSec, manuel: true };
  }
  return { ...palierAutomatique(), manuel: false };
}

function formatGainage(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return s === 0 ? `${m} min` : `${m}m${String(s).padStart(2,'0')}`;
}

// ── Réveil / Soir ────────────────────────────────────────────
function jourActifPourRoutine(cle, date = new Date()) {
  const jourKey = JOURS_SEMAINE[date.getDay()];
  const champ = cle === 'reveil' ? 'joursActifsReveil' : 'joursActifsSoir';
  const table = ETAT[champ] || {};
  return table[jourKey] !== false; // true par défaut si absent
}

function afficherRoutine(cle) {
  const carte = document.getElementById(`carte-${cle}`);
  const contenu = document.getElementById(`contenu-${cle}`);
  const reposMsg = document.getElementById(`repos-msg-${cle}`);

  if (!jourActifPourRoutine(cle)) {
    contenu.style.display = 'none';
    reposMsg.style.display = 'block';
    carte.classList.remove('carte-clic-motivation');
    return;
  }
  contenu.style.display = 'block';
  reposMsg.style.display = 'none';
  carte.classList.add('carte-clic-motivation');

  const palier = palierPourRoutine(cle);
  document.getElementById(`mois-badge-${cle}`).textContent = palier.manuel ? '✏️ Manuel' : `Mois ${palier.mois}`;

  const listePrincipale = document.getElementById(`liste-${cle}-principal`);
  listePrincipale.innerHTML = `
    <li>${palier.pompes} pompes</li>
    <li>${formatGainage(palier.gainageSec)} de gainage</li>`;

  if (cle === 'reveil') {
    document.getElementById('liste-reveil-musculaire').innerHTML =
      ETAT.reveilMusculaire.map(ex => `<li>${ex}</li>`).join('');
  } else {
    document.getElementById('liste-abdos-soir').innerHTML =
      ETAT.circuitAbdosSoir.map(ex => `<li>${ex}</li>`).join('');
  }

  afficherVideoRoutine(cle);

  const btn = document.getElementById(`btn-fait-${cle}`);
  const fait = ETAT.journalDuJour[`${cle}Fait`];
  btn.textContent = fait ? '✓ Fait' : 'Marquer comme fait';
  btn.classList.toggle('fait', fait);
}

async function toggleFait(cle) {
  const nouvelEtat = !ETAT.journalDuJour[`${cle}Fait`];
  await sauverJournalDuJour({ [`${cle}Fait`]: nouvelEtat });
  afficherRoutine(cle);
}

// ── Édition Réveil musculaire / Circuit abdos soir / Petit-déj ──
let ciblerEditionCourante = null;
function ouvrirEditionRoutine(cle) {
  ciblerEditionCourante = cle;
  document.getElementById('modal-edition-titre').textContent =
    cle === 'reveil' ? 'Modifier le réveil' : 'Modifier le soir';
  document.querySelector('#modal-edition .modal-note').textContent = 'Une ligne par exercice complémentaire.';

  // Champs pompes / gainage (override manuel)
  document.getElementById('zone-override-pompes').style.display = 'block';
  const palier = palierPourRoutine(cle);
  document.getElementById('override-pompes').value = palier.pompes;
  document.getElementById('override-gainage').value = palier.gainageSec;
  document.getElementById('btn-reset-auto').style.display = palier.manuel ? 'block' : 'none';

  const champ = cle === 'reveil' ? 'reveilMusculaire' : 'circuitAbdosSoir';
  document.getElementById('modal-edition-texte').value = ETAT[champ].join('\n');

  // Vidéo complémentaire
  document.getElementById('zone-video-routine').style.display = 'block';
  const champVideo = cle === 'reveil' ? 'videoReveil' : 'videoSoir';
  const video = ETAT[champVideo] || { texte: '', url: '' };
  document.getElementById('video-routine-texte').value = video.texte || '';
  document.getElementById('video-routine-url').value = video.url || '';

  document.getElementById('modal-edition').style.display = 'flex';
}

function ouvrirEditionPetitDej() {
  const jourKey = JOURS_SEMAINE[new Date().getDay()];
  ciblerEditionCourante = 'petitdej-' + jourKey;
  document.getElementById('modal-edition-titre').textContent = `Petit-déjeuner du ${JOURS_AFFICHAGE[new Date().getDay()].toLowerCase()}`;
  document.querySelector('#modal-edition .modal-note').textContent = '';
  document.getElementById('zone-override-pompes').style.display = 'none';
  document.getElementById('zone-video-routine').style.display = 'none';
  document.getElementById('modal-edition-texte').value = ETAT.petitsDejeuners[jourKey] || '';
  document.getElementById('modal-edition').style.display = 'flex';
}

async function sauverEditionRoutine() {
  if (ciblerEditionCourante && ciblerEditionCourante.startsWith('petitdej-')) {
    const jourKey = ciblerEditionCourante.replace('petitdej-', '');
    const texte = document.getElementById('modal-edition-texte').value.trim();
    const petitsDejeuners = { ...ETAT.petitsDejeuners, [jourKey]: texte };
    await sauverEtat({ petitsDejeuners });
    afficherPetitDej();
    fermerModalEdition();
    return;
  }

  const cle = ciblerEditionCourante;
  const texte = document.getElementById('modal-edition-texte').value;
  const lignes = texte.split('\n').map(l => l.trim()).filter(Boolean);
  const champListe = cle === 'reveil' ? 'reveilMusculaire' : 'circuitAbdosSoir';

  // Override pompes/gainage : dès que la fenêtre est enregistrée, la valeur
  // affichée devient la référence manuelle (fige la progression automatique).
  const pompes = parseInt(document.getElementById('override-pompes').value, 10);
  const gainageSec = parseInt(document.getElementById('override-gainage').value, 10);
  const champOverride = cle === 'reveil' ? 'overrideReveil' : 'overrideSoir';

  const champVideo = cle === 'reveil' ? 'videoReveil' : 'videoSoir';
  const videoTexte = document.getElementById('video-routine-texte').value.trim();
  const videoUrl = document.getElementById('video-routine-url').value.trim();

  await sauverEtat({
    [champListe]: lignes,
    [champOverride]: { pompes, gainageSec },
    [champVideo]: { texte: videoTexte, url: videoUrl },
  });
  afficherRoutine(cle);
  fermerModalEdition();
}

async function reinitialiserProgressionAuto() {
  const cle = ciblerEditionCourante;
  const champOverride = cle === 'reveil' ? 'overrideReveil' : 'overrideSoir';
  await sauverEtat({ [champOverride]: null });
  const palier = palierAutomatique();
  document.getElementById('override-pompes').value = palier.pompes;
  document.getElementById('override-gainage').value = palier.gainageSec;
  document.getElementById('btn-reset-auto').style.display = 'none';
}

function fermerModalEdition() {
  document.getElementById('modal-edition').style.display = 'none';
  ciblerEditionCourante = null;
}

// ── Petit-déjeuner ───────────────────────────────────────────
function afficherPetitDej() {
  const jourKey = JOURS_SEMAINE[new Date().getDay()];
  document.getElementById('petit-dej-texte').textContent = ETAT.petitsDejeuners[jourKey] || '';
}

// ── Séance du jour ───────────────────────────────────────────
function afficherSeanceDuJour() {
  const zone = document.getElementById('zone-seance-jour');
  const type = typeDuJour();
  const typeInfo = ETAT.typesSeance.find(t => t.id === type);

  if (type === 'repos') {
    zone.innerHTML = `
      <div class="carte carte-repos">
        <div class="carte-eyebrow">😌 Aujourd'hui</div>
        <p style="margin:0;font-size:14px;color:var(--ink-soft)">Jour de repos — pas de séance sportive dédiée.</p>
      </div>`;
    return;
  }

  if (type === 'course') {
    zone.innerHTML = `
      <div class="carte carte-seance">
        <div class="carte-eyebrow"><span>🏃 Séance du jour — Course</span></div>
        <p style="margin:0 0 10px;font-size:14px;color:var(--ink-soft)">Une sortie course à votre rythme — 25 à 30 minutes environ.</p>
        <button class="btn-fait sport" onclick="toggleSeanceFaite()">${ETAT.journalDuJour.seanceFaite ? '✓ Séance faite' : '🔥 Marquer la séance comme faite'}</button>
      </div>`;
    return;
  }

  if (type === 'muscu') {
    const video = ETAT.videos.liste.find(v => v.id === ETAT.videos.actifId) || ETAT.videos.liste[0];
    if (!video) {
      zone.innerHTML = `
        <div class="carte carte-seance">
          <div class="carte-eyebrow"><span>🏋️ Séance du jour — Muscu</span>
            <button class="lien-gerer" onclick="ouvrirReglages();ouvrirVideos()">Ajouter</button></div>
          <p style="margin:0;font-size:13px;color:var(--ink-soft)">Aucune vidéo enregistrée — ajoutez-en une dans Réglages.</p>
        </div>`;
      return;
    }
    const idVid = extraireIdYoutube(video.url);
    zone.innerHTML = `
      <div class="carte carte-seance">
        <div class="carte-eyebrow">
          <span>🏋️ Séance du jour — Muscu</span>
          <button class="lien-gerer" onclick="ouvrirChoixVideo()">Changer</button>
        </div>
        <a href="${video.url}" target="_blank" style="text-decoration:none">
          <div class="seance-video">
            <img src="https://img.youtube.com/vi/${idVid}/hqdefault.jpg" alt="">
            <div class="play-overlay"><svg viewBox="0 0 24 24" width="44" height="44" fill="white"><path d="M8 5v14l11-7z"/></svg></div>
          </div>
        </a>
        <p class="seance-titre-video">${video.label}</p>
        <button class="btn-fait sport" onclick="toggleSeanceFaite()">${ETAT.journalDuJour.seanceFaite ? '✓ Séance faite' : '🔥 Marquer la séance comme faite'}</button>
      </div>`;
    return;
  }

  zone.innerHTML = `
    <div class="carte carte-seance" style="border-left-color:${typeInfo?.couleur || 'var(--coral)'}">
      <div class="carte-eyebrow" style="color:${typeInfo?.couleur || 'var(--coral)'}"><span>🎯 Séance du jour — ${typeInfo?.nom || type}</span></div>
      <button class="btn-fait sport" onclick="toggleSeanceFaite()">${ETAT.journalDuJour.seanceFaite ? '✓ Séance faite' : '🔥 Marquer la séance comme faite'}</button>
    </div>`;
}

async function toggleSeanceFaite() {
  await sauverJournalDuJour({ seanceFaite: !ETAT.journalDuJour.seanceFaite });
  afficherSeanceDuJour();
  if (ETAT.suiviSerieActive) afficherStreak();
}

function extraireIdYoutube(url) {
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{6,})/);
  return m ? m[1] : '';
}

// ── Choix de la vidéo active (depuis la page d'accueil) ─────
function ouvrirChoixVideo() {
  const liste = document.getElementById('modal-choix-video-liste');
  if (ETAT.videos.liste.length === 0) {
    liste.innerHTML = `<p class="text-sm">Aucune vidéo enregistrée. Ajoutez-en dans Réglages → Gérer mes vidéos.</p>`;
  } else {
    liste.innerHTML = ETAT.videos.liste.map(v => `
      <div class="lien-item ${v.id === ETAT.videos.actifId ? 'actif' : ''}" onclick="choisirVideoActive('${v.id}')">
        <img class="lien-thumb" src="https://img.youtube.com/vi/${extraireIdYoutube(v.url)}/hqdefault.jpg">
        <div class="lien-info"><div class="lien-label">${v.label}</div></div>
        <div class="lien-radio ${v.id === ETAT.videos.actifId ? 'checked' : ''}"></div>
      </div>`).join('');
  }
  document.getElementById('modal-choix-video').style.display = 'flex';
}
function fermerChoixVideo() { document.getElementById('modal-choix-video').style.display = 'none'; }
async function choisirVideoActive(id) {
  ETAT.videos.actifId = id;
  afficherSeanceDuJour();
  fermerChoixVideo();
  await sauverVideosFirestore();
}

// ── Rappel "si pas fait" (uniquement à l'ouverture) ─────────
function afficherRappelSiPasFait() {
  const zone = document.getElementById('zone-rappel');
  const heure = new Date().getHours();
  const messages = [];

  if (heure >= CONFIG.rappelReveilApres && !ETAT.journalDuJour.reveilFait) {
    messages.push("Vous n'avez pas encore marqué votre réveil comme fait aujourd'hui.");
  }
  if (heure >= CONFIG.rappelSoirApres) {
    if (!ETAT.journalDuJour.soirFait) messages.push("Pensez à votre routine du soir.");
    if (typeDuJour() !== 'repos' && !ETAT.journalDuJour.seanceFaite) messages.push("Votre séance du jour n'est pas encore validée.");
  }

  if (messages.length === 0) { zone.innerHTML = ''; return; }
  zone.innerHTML = `<div class="carte carte-rappel"><div class="carte-eyebrow" style="color:var(--coral)">⏰ Petit rappel</div>
    <p style="margin:0;font-size:13.5px;color:var(--ink)">${messages.join(' ')}</p></div>`;
}

// ── Bilan du dimanche ────────────────────────────────────────
async function afficherBilanDimanche() {
  const zone = document.getElementById('zone-bilan-dimanche');
  if (new Date().getDay() !== 0 || !db) { zone.innerHTML = ''; return; }

  const jours = [];
  const curseurInit = new Date();
  for (let i = 0; i < 7; i++) {
    jours.push(new Date(curseurInit));
    curseurInit.setDate(curseurInit.getDate() - 1);
  }

  const resultats = await Promise.all(jours.map(async date => {
    const type = typeDuJour(date);
    try {
      const snap = await db.collection('journal').doc(cleDuJour(date)).get();
      const d = snap.exists ? snap.data() : {};
      return { type, seanceFaite: !!d.seanceFaite, reveilFait: !!d.reveilFait };
    } catch (e) {
      return { type, seanceFaite: false, reveilFait: false };
    }
  }));

  let seancesPrevues = 0, seancesFaites = 0, reveilsFaits = 0;
  resultats.forEach(r => {
    if (r.type !== 'repos') { seancesPrevues++; if (r.seanceFaite) seancesFaites++; }
    if (r.reveilFait) reveilsFaits++;
  });

  zone.innerHTML = `
    <div class="carte carte-bilan">
      <div class="carte-eyebrow">🗞️ Bilan de la semaine</div>
      <p style="margin:0;font-size:14px;line-height:1.6;color:var(--ink)">
        ${seancesFaites} séance${seancesFaites>1?'s':''} sur ${seancesPrevues} prévue${seancesPrevues>1?'s':''} ·
        ${reveilsFaits} réveil${reveilsFaits>1?'s':''} sur 7
      </p>
    </div>`;
}

// ── Intention du jour ────────────────────────────────────────
function afficherIntentionDuJour() {
  const zone = document.getElementById('zone-intention');
  if (!ETAT.intentionDuJourActive) { zone.innerHTML = ''; return; }
  zone.innerHTML = `
    <div class="carte">
      <div class="carte-eyebrow" style="color:var(--moss)">🎯 Intention du jour</div>
      <input type="text" class="intention-input" placeholder="Aujourd'hui, je veux..."
        value="${ETAT.journalDuJour.intentionTexte || ''}"
        onchange="sauverJournalDuJour({intentionTexte:this.value})">
    </div>`;
}

// ── Marchés financiers ───────────────────────────────────────
async function chargerMarches() {
  const container = document.getElementById('marches-liste');
  container.innerHTML = CONFIG.marches.map(m =>
    `<div class="marche-ligne" id="marche-${m.symbole.replace('^','')}">
       <span class="marche-nom">${m.nom}</span><span class="marche-valeur">…</span></div>`
  ).join('');
  for (const marche of CONFIG.marches) chargerUnMarche(marche);
}
// Yahoo Finance a été retiré : bloqué par CORS dans 100% des cas en usage réel
// depuis un navigateur (confirmé), inutile de tenter l'appel à chaque fois.
async function essayerTwelveData(symboleTwelveData, exchangeTwelveData) {
  if (!CONFIG.twelveDataApiKey) throw new Error('Pas de clé Twelve Data');
  let url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symboleTwelveData)}&apikey=${CONFIG.twelveDataApiKey}`;
  if (exchangeTwelveData) url += `&exchange=${encodeURIComponent(exchangeTwelveData)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const data = await r.json();
  if (data.status === 'error' || !data.close) throw new Error(data.message || 'Données vides');
  return { prix: parseFloat(data.close), cloturePrec: parseFloat(data.previous_close) };
}
async function chargerUnMarche(marche) {
  const ligne = document.getElementById(`marche-${marche.symbole.replace('^','')}`);
  let resultat = null;
  try {
    resultat = await essayerTwelveData(marche.symboleTwelveData, marche.exchangeTwelveData);
  } catch (e) { console.warn(`Marché ${marche.nom} indisponible`, e); }
  if (!resultat || !resultat.prix || !resultat.cloturePrec) {
    ligne.innerHTML = `<span class="marche-nom">${marche.nom}</span><span class="marche-valeur marche-indispo">indisponible</span>`;
    return;
  }
  const variation = resultat.prix - resultat.cloturePrec;
  const variationPct = (variation / resultat.cloturePrec) * 100;
  const hausse = variation >= 0;
  ligne.innerHTML = `<span class="marche-nom">${marche.nom}</span>
    <span class="marche-valeur">${resultat.prix.toLocaleString('fr-FR',{maximumFractionDigits:2})} ${marche.devise}
    <span class="marche-variation ${hausse?'hausse':'baisse'}">${hausse?'▲':'▼'} ${Math.abs(variationPct).toFixed(2)}%</span></span>`;
}

// ── Anecdote du jour (Wikimedia, français) ──────────────────
async function chargerAnecdote() {
  const zone = document.getElementById('anecdote-texte');
  const maintenant = new Date();
  const mois = String(maintenant.getMonth()+1).padStart(2,'0');
  const jour = String(maintenant.getDate()).padStart(2,'0');
  try {
    const resp = await fetch(`https://api.wikimedia.org/feed/v1/wikipedia/fr/onthisday/events/${mois}/${jour}`);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const evenements = data.events || [];
    if (evenements.length === 0) throw new Error('Aucun événement');
    const moitieAncienne = evenements.slice(Math.floor(evenements.length/2));
    const pool = moitieAncienne.length > 0 ? moitieAncienne : evenements;
    const evt = pool[Math.floor(Math.random()*pool.length)];
    zone.textContent = `En ${evt.year} : ${evt.text}`;
  } catch (e) {
    zone.textContent = "Pas d'anecdote disponible aujourd'hui — reconnectez-vous plus tard.";
  }
}

// =============================================================
// ÉCRAN RÉGLAGES
// =============================================================
function ouvrirReglages() {
  document.getElementById('vue-accueil').style.display = 'none';
  document.getElementById('vue-reglages').style.display = 'block';
  afficherTypesSeance();
  afficherPlanningSemaine();
  afficherMenuPetitDejSemaine();
  afficherJoursActifs();
  document.getElementById('toggle-intention').classList.toggle('on', ETAT.intentionDuJourActive);
  document.getElementById('toggle-serie').classList.toggle('on', ETAT.suiviSerieActive);
  document.getElementById('record-gainage').value = ETAT.recordGainage || '';
}

// ── Jours actifs Réveil / Soir ───────────────────────────────
const ABREV_JOURS = { lundi:'L', mardi:'M', mercredi:'M', jeudi:'J', vendredi:'V', samedi:'S', dimanche:'D' };
function afficherJoursActifs() {
  const ordre = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
  ['reveil','soir'].forEach(cle => {
    const champ = cle === 'reveil' ? 'joursActifsReveil' : 'joursActifsSoir';
    const table = ETAT[champ] || {};
    const zone = document.getElementById(`jours-actifs-${cle}`);
    zone.innerHTML = ordre.map(j => `
      <label class="jour-case-item">
        <input type="checkbox" ${table[j] !== false ? 'checked' : ''}
          onchange="toggleJourActif('${cle}', '${j}', this.checked)">
        <span>${ABREV_JOURS[j]}</span>
      </label>`).join('');
  });
}
async function toggleJourActif(cle, jourKey, actif) {
  const champ = cle === 'reveil' ? 'joursActifsReveil' : 'joursActifsSoir';
  const table = { ...(ETAT[champ] || {}), [jourKey]: actif };
  await sauverEtat({ [champ]: table });
  afficherRoutine(cle);
}

function afficherMenuPetitDejSemaine() {
  const zone = document.getElementById('menu-petitdej-semaine');
  const ordre = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
  zone.innerHTML = ordre.map(jourKey => `
    <div class="menu-jour-bloc">
      <label class="menu-jour-label">${jourKey.charAt(0).toUpperCase()+jourKey.slice(1)}</label>
      <textarea class="menu-jour-texte" rows="2"
        onchange="modifierPetitDejJour('${jourKey}', this.value)">${ETAT.petitsDejeuners[jourKey] || ''}</textarea>
    </div>`).join('');
}
async function modifierPetitDejJour(jourKey, texte) {
  const petitsDejeuners = { ...ETAT.petitsDejeuners, [jourKey]: texte.trim() };
  await sauverEtat({ petitsDejeuners });
  if (jourKey === JOURS_SEMAINE[new Date().getDay()]) afficherPetitDej();
}
function fermerReglages() {
  document.getElementById('vue-reglages').style.display = 'none';
  document.getElementById('vue-accueil').style.display = 'block';
  afficherSeanceDuJour();
  afficherStreak();
}

function afficherTypesSeance() {
  const zone = document.getElementById('liste-types-seance');
  zone.innerHTML = ETAT.typesSeance.map(t => `
    <div class="type-item">
      <div class="type-pastille" style="background:${t.couleur}"></div>
      <span class="type-nom">${t.nom}</span>
      ${['course','muscu','repos'].includes(t.id) ? '' : `<button class="type-suppr" onclick="supprimerTypeSeance('${t.id}')">✕</button>`}
    </div>`).join('');
  document.getElementById('limite-types-note').textContent = `${ETAT.typesSeance.length}/5 utilisés`;
}

async function ajouterTypeSeance() {
  const champ = document.getElementById('nouveau-type-nom');
  const nom = champ.value.trim();
  if (!nom) return;
  if (ETAT.typesSeance.length >= 5) { alert('Maximum 5 types de séance.'); return; }
  const couleurs = ['#6E8F6B', '#8A6BAF', '#C98A3E', '#3EAFA0'];
  const couleur = couleurs[ETAT.typesSeance.length % couleurs.length];
  const id = 'perso-' + Date.now();
  const typesSeance = [...ETAT.typesSeance, { id, nom, couleur }];
  await sauverEtat({ typesSeance });
  champ.value = '';
  afficherTypesSeance();
}
async function supprimerTypeSeance(id) {
  const typesSeance = ETAT.typesSeance.filter(t => t.id !== id);
  const planningSemaine = { ...ETAT.planningSemaine };
  Object.keys(planningSemaine).forEach(j => { if (planningSemaine[j] === id) planningSemaine[j] = 'repos'; });
  await sauverEtat({ typesSeance, planningSemaine });
  afficherTypesSeance();
  afficherPlanningSemaine();
}

function afficherPlanningSemaine() {
  const zone = document.getElementById('planning-semaine-liste');
  const ordre = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
  zone.innerHTML = ordre.map(jourKey => {
    const typeActuel = ETAT.planningSemaine[jourKey];
    const options = ETAT.typesSeance.map(t =>
      `<option value="${t.id}" ${t.id===typeActuel?'selected':''}>${t.nom}</option>`).join('');
    return `
      <div class="jour-planning-ligne">
        <span class="jour-planning-nom">${jourKey.charAt(0).toUpperCase()+jourKey.slice(1)}</span>
        <select class="jour-select-natif" onchange="changerTypeJour('${jourKey}', this.value)">${options}</select>
      </div>`;
  }).join('');
}
async function changerTypeJour(jourKey, typeId) {
  const planningSemaine = { ...ETAT.planningSemaine, [jourKey]: typeId };
  await sauverEtat({ planningSemaine });
}

async function toggleReglage(champ) {
  const nouvelleValeur = !ETAT[champ];
  await sauverEtat({ [champ]: nouvelleValeur });
  document.getElementById(champ === 'intentionDuJourActive' ? 'toggle-intention' : 'toggle-serie')
    .classList.toggle('on', nouvelleValeur);
}

async function sauverRecordGainage() {
  const valeur = document.getElementById('record-gainage').value.trim();
  await sauverEtat({ recordGainage: valeur });
}

// =============================================================
// ÉCRAN VIDÉOS
// =============================================================
function ouvrirVideos() {
  document.getElementById('vue-reglages').style.display = 'none';
  document.getElementById('vue-videos').style.display = 'block';
  afficherListeVideos();
}
function fermerVideos() {
  document.getElementById('vue-videos').style.display = 'none';
  document.getElementById('vue-reglages').style.display = 'block';
}
function afficherListeVideos() {
  const zone = document.getElementById('liste-videos');
  if (ETAT.videos.liste.length === 0) {
    zone.innerHTML = `<p class="text-sm" style="margin-bottom:10px">Aucune vidéo enregistrée pour l'instant.</p>`;
    return;
  }
  zone.innerHTML = ETAT.videos.liste.map(v => `
    <div class="lien-item ${v.id === ETAT.videos.actifId ? 'actif' : ''}">
      <img class="lien-thumb" src="https://img.youtube.com/vi/${extraireIdYoutube(v.url)}/hqdefault.jpg">
      <div class="lien-info"><div class="lien-label">${v.label}</div></div>
      <div class="lien-radio ${v.id === ETAT.videos.actifId ? 'checked' : ''}" onclick="choisirVideoActive('${v.id}');afficherListeVideos()"></div>
      <button class="lien-suppr" onclick="supprimerVideo('${v.id}')">✕</button>
    </div>`).join('');
}
async function sauverVideosFirestore() {
  if (!db) return;
  try {
    await db.collection('etat').doc('videos').set(ETAT.videos, { merge: true });
  } catch (e) { console.warn('Sauvegarde vidéos impossible (hors-ligne ?)', e); }
}
async function ajouterVideo() {
  const url = document.getElementById('nouvelle-video-url').value.trim();
  const label = document.getElementById('nouvelle-video-label').value.trim();
  if (!url || !label) { alert('Merci de remplir le lien et le petit nom.'); return; }
  const id = 'video-' + Date.now();
  const liste = [...ETAT.videos.liste, { id, url, label }];
  const actifId = ETAT.videos.actifId || id;
  ETAT.videos = { liste, actifId };
  document.getElementById('nouvelle-video-url').value = '';
  document.getElementById('nouvelle-video-label').value = '';
  afficherListeVideos();
  await sauverVideosFirestore();
}
async function supprimerVideo(id) {
  const liste = ETAT.videos.liste.filter(v => v.id !== id);
  let actifId = ETAT.videos.actifId;
  if (actifId === id) actifId = liste[0]?.id || null;
  ETAT.videos = { liste, actifId };
  afficherListeVideos();
  await sauverVideosFirestore();
}

// =============================================================
// ÉCRAN CALENDRIER
// =============================================================
async function ouvrirCalendrier() {
  document.getElementById('vue-reglages').style.display = 'none';
  document.getElementById('vue-calendrier').style.display = 'block';
  await afficherCalendrierMensuel();
}
function fermerCalendrier() {
  document.getElementById('vue-calendrier').style.display = 'none';
  document.getElementById('vue-reglages').style.display = 'block';
}
async function afficherCalendrierMensuel() {
  const maintenant = new Date();
  document.getElementById('calendrier-titre-mois').textContent =
    `${MOIS_AFFICHAGE[maintenant.getMonth()]} ${maintenant.getFullYear()}`;

  const nbJours = new Date(maintenant.getFullYear(), maintenant.getMonth()+1, 0).getDate();
  const grille = document.getElementById('calendrier-grille');
  grille.innerHTML = '<div class="text-sm" style="grid-column:1/-1;text-align:center;padding:20px 0">Chargement…</div>';

  const jours = Array.from({length: nbJours}, (_, i) =>
    new Date(maintenant.getFullYear(), maintenant.getMonth(), i + 1));

  // Toutes les lectures Firestore en parallèle (pas une par une : trop lent,
  // et potentiellement bloquant si la connexion est mauvaise).
  const resultats = await Promise.all(jours.map(async date => {
    const type = typeDuJour(date);
    const estFutur = date > maintenant;
    if (type === 'repos' || estFutur || !db) return { date, type, estFutur, fait: null };
    try {
      const snap = await db.collection('journal').doc(cleDuJour(date)).get();
      return { date, type, estFutur, fait: snap.exists && snap.data().seanceFaite === true };
    } catch (e) {
      return { date, type, estFutur, fait: false };
    }
  }));

  grille.innerHTML = resultats.map(r => {
    let pastille = '—';
    if (!r.estFutur && r.type !== 'repos') pastille = r.fait ? '🟠' : '⚪';
    return `<div class="calendrier-case ${r.estFutur ? 'futur' : ''}">
      <div class="calendrier-num">${r.date.getDate()}</div>
      <div class="calendrier-pastille">${r.estFutur ? '' : pastille}</div>
    </div>`;
  }).join('');
}

// =============================================================
// CHRONO GAINAGE
// =============================================================
const MESSAGES_FIN_CHRONO = [
  "Allez, maintenant les pompes ! 💪 Bravo pour le gainage.",
  "Beau gainage ! Direction les pompes, vous gérez.",
  "C'est fait ! Encore un effort avec les pompes et la séance est bouclée.",
  "Excellent gainage. Aux pompes maintenant, vous êtes lancé !",
  "Bravo, le plus dur est fait. Les pompes vont être une formalité.",
];

let wakeLockActif = null;

async function demanderWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLockActif = await navigator.wakeLock.request('screen');
    }
  } catch (e) { console.warn('Wake Lock indisponible', e); }
}
function relacherWakeLock() {
  if (wakeLockActif) { wakeLockActif.release().catch(()=>{}); wakeLockActif = null; }
}

function ouvrirChrono(secondes) {
  ETAT.chronoSecondesRestantes = secondes || moisProgressionActuel().gainageSec;
  afficherChrono();
  document.getElementById('chrono-affichage').classList.remove('chrono-message-fin');
  document.getElementById('btn-chrono-demarrer').textContent = '▶️ Démarrer';
  document.getElementById('modal-chrono').style.display = 'flex';
}
function afficherChrono() {
  const m = Math.floor(ETAT.chronoSecondesRestantes / 60);
  const s = ETAT.chronoSecondesRestantes % 60;
  document.getElementById('chrono-affichage').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function toggleChrono() {
  const btn = document.getElementById('btn-chrono-demarrer');
  if (ETAT.chronoInterval) {
    clearInterval(ETAT.chronoInterval);
    ETAT.chronoInterval = null;
    btn.textContent = '▶️ Reprendre';
    relacherWakeLock();
  } else {
    btn.textContent = '⏸️ Pause';
    demanderWakeLock();
    ETAT.chronoInterval = setInterval(() => {
      ETAT.chronoSecondesRestantes--;
      afficherChrono();
      if (ETAT.chronoSecondesRestantes <= 0) {
        clearInterval(ETAT.chronoInterval);
        ETAT.chronoInterval = null;
        relacherWakeLock();
        if (navigator.vibrate) navigator.vibrate([200,100,200]);
        const msg = MESSAGES_FIN_CHRONO[Math.floor(Math.random() * MESSAGES_FIN_CHRONO.length)];
        const affichage = document.getElementById('chrono-affichage');
        affichage.textContent = msg;
        affichage.classList.add('chrono-message-fin');
        btn.textContent = '✓ Terminé';
      }
    }, 1000);
  }
}
function fermerChrono() {
  if (ETAT.chronoInterval) clearInterval(ETAT.chronoInterval);
  ETAT.chronoInterval = null;
  relacherWakeLock();
  document.getElementById('modal-chrono').style.display = 'none';
}

// Ré-active le Wake Lock si l'onglet redevient visible pendant un chrono en cours
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && ETAT.chronoInterval) demanderWakeLock();
});

// =============================================================
// MOTIVATION DU JOUR (clic sur le titre Réveil ou Soir)
// =============================================================
const VIDEO_TECHNIQUE_POMPES = 't-I28JRPEag';
const VIDEO_TECHNIQUE_GAINAGE = '_YHkhPaXyZc';

function ouvrirMotivation(cle) {
  const format = formatMotivationDuJour();
  const titre = document.getElementById('motivation-titre');
  const contenu = document.getElementById('motivation-contenu');
  titre.textContent = cle === 'reveil' ? '☀️ Un coup de boost pour démarrer' : '🌙 Pour finir la journée en beauté';

  if (format === 'video1' || format === 'video2') {
    const idVideo = format === 'video1' ? VIDEO_TECHNIQUE_POMPES : VIDEO_TECHNIQUE_GAINAGE;
    const label = format === 'video1' ? 'Bien exécuter ses pompes' : 'Bien tenir la planche (gainage)';
    contenu.innerHTML = `
      <a href="https://www.youtube.com/watch?v=${idVideo}" target="_blank" style="text-decoration:none">
        <div class="motivation-video">
          <img src="https://img.youtube.com/vi/${idVideo}/hqdefault.jpg" alt="">
          <div class="play-overlay"><svg viewBox="0 0 24 24" width="44" height="44" fill="white"><path d="M8 5v14l11-7z"/></svg></div>
        </div>
      </a>
      <p style="text-align:center;font-size:13px;color:var(--ink-soft);margin-top:8px">${label}</p>`;

  } else if (format === 'illustration') {
    contenu.innerHTML = `
      <div class="motivation-illustration">
        <svg width="140" height="160" viewBox="0 0 140 160" fill="none">
          <circle cx="70" cy="28" r="16" fill="#1E2430"/>
          <path d="M70 44 L70 95" stroke="#1E2430" stroke-width="10" stroke-linecap="round"/>
          <path d="M70 55 L35 40 M70 55 L105 40" stroke="#FF6B4A" stroke-width="9" stroke-linecap="round"/>
          <path d="M70 95 L45 145 M70 95 L95 145" stroke="#1E2430" stroke-width="10" stroke-linecap="round"/>
          <path d="M55 20 L60 8 M85 20 L80 8 M70 8 L70 2" stroke="#FFC97A" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="motivation-citation" style="font-size:15px">La meilleure version de vous-même vous attend, une répétition à la fois.</p>`;

  } else if (format === 'citation-sport') {
    const c = citationDuJour(CITATIONS_SPORT, new Date());
    contenu.innerHTML = `<p class="motivation-citation">« ${c.texte} »</p><p class="motivation-auteur">— ${c.auteur}</p>`;

  } else if (format === 'citation-athlete') {
    const c = citationDuJour(CITATIONS_ATHLETES, new Date());
    contenu.innerHTML = `<p class="motivation-citation">« ${c.texte} »</p><p class="motivation-auteur">— ${c.auteur}</p>`;

  } else if (format === 'animation') {
    contenu.innerHTML = `
      <div class="anim-pompe"><div class="anim-pompe-bonhomme">🏋️</div></div>
      <p style="text-align:center;font-size:14px;color:var(--ink-soft)">Allez, encore un effort !</p>`;

  } else if (format === 'fait') {
    const idx = jourDeLAnnee(new Date()) % FAITS_MOTIVANTS.length;
    contenu.innerHTML = `<p class="motivation-fait">💡 ${FAITS_MOTIVANTS[idx]}</p>`;
  }

  document.getElementById('modal-motivation').style.display = 'flex';
}
function fermerMotivation() {
  document.getElementById('modal-motivation').style.display = 'none';
}

// =============================================================
// VIDÉO COMPLÉMENTAIRE RÉVEIL / SOIR (texte + lien YouTube/Facebook/TikTok)
// =============================================================
function detecterPlateformeVideo(url) {
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/facebook\.com|fb\.watch/.test(url)) return 'facebook';
  return 'autre';
}

function afficherVideoRoutine(cle) {
  const champ = cle === 'reveil' ? 'videoReveil' : 'videoSoir';
  const zone = document.getElementById(`zone-video-${cle}`);
  const video = ETAT[champ];

  if (!video || (!video.texte && !video.url)) { zone.innerHTML = ''; return; }

  let html = '<div class="video-routine-bloc">';
  if (video.texte) html += `<p class="video-routine-texte">${video.texte}</p>`;

  if (video.url) {
    const plateforme = detecterPlateformeVideo(video.url);
    if (plateforme === 'youtube') {
      const idVid = extraireIdYoutube(video.url);
      html += `<a href="${video.url}" target="_blank" class="video-routine-lien" onclick="event.stopPropagation()">
        <div class="video-routine-thumb">
          <img src="https://img.youtube.com/vi/${idVid}/hqdefault.jpg" alt="">
          <div class="play-mini"><svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M8 5v14l11-7z"/></svg></div>
        </div>
        <span>Voir la vidéo</span>
      </a>`;
    } else {
      const icone = plateforme === 'tiktok' ? '🎵' : plateforme === 'facebook' ? '📘' : '🎬';
      html += `<a href="${video.url}" target="_blank" class="video-routine-lien" onclick="event.stopPropagation()">
        <span style="font-size:20px">${icone}</span><span>Voir la vidéo</span>
      </a>`;
    }
  }
  html += '</div>';
  zone.innerHTML = html;
}

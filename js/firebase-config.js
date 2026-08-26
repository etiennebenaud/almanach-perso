// =============================================================
// FIREBASE — À remplacer par votre configuration réelle
// Firebase Console → Paramètres du projet → Vos applications → Config
// =============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBcZC-YPVMNicZAmHpCH0KX3hhLImFYcnQ",
  authDomain: "almanach-perso.firebaseapp.com",
  projectId: "almanach-perso",
  storageBucket: "almanach-perso.firebasestorage.app",
  messagingSenderId: "82377909707",
  appId: "1:82377909707:web:a56143d868f6b4cc1bc24e",
};

let db = null;
function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase OK');
  } catch (e) {
    console.error('Firebase non configuré :', e);
  }
}

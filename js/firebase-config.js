// Firebase Configuration - Shared across all pages
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, set, update, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyArQ-fQJzxXzpZURarQk5ToWG3U0Mvnb9s",
    authDomain: "productivity-f97aa.firebaseapp.com",
    databaseURL: "https://productivity-f97aa-default-rtdb.firebaseio.com",
    projectId: "productivity-f97aa",
    storageBucket: "productivity-f97aa.firebasestorage.app",
    messagingSenderId: "131702264076",
    appId: "1:131702264076:web:2a4fbc07f1246c0edef929",
    measurementId: "G-QC2Z41X5EY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

// Helper functions
async function logActivity(userUid, text) {
    if (!userUid) return;
    await push(ref(db, 'activity/' + userUid), { text, ts: Date.now() });
}

async function ensureUserRecord(user, initialName = '') {
    if (!user) return;
    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);
    if (!snap.exists()) {
        await set(userRef, {
            name: initialName || user.displayName || (user.isAnonymous ? 'Guest' : (user.email || 'User')),
            email: user.email || null,
            photoURL: user.photoURL || null,
            streak: 0,
            bestStreak: 0,
            lastCheckin: "",
            logins: 1,
            checkinsGood: 0,
            checkinsBad: 0,
            urges: 0,
            badges: [],
            weeklyGoal: 7,
            createdAt: Date.now()
        });
        await logActivity(user.uid, 'Account created');
    } else {
        const data = snap.val();
        await update(userRef, { logins: (data.logins || 0) + 1 });
        await logActivity(user.uid, 'Logged in');
    }
}

function checkAuth(redirectToLogin = true) {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            if (!user && redirectToLogin) {
                window.location.href = 'index.html';
            }
            resolve(user);
        });
    });
}

export {
    app, auth, db, googleProvider,
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signInAnonymously, signInWithPopup, onAuthStateChanged, signOut,
    ref, get, set, update, push,
    logActivity, ensureUserRecord, checkAuth
};

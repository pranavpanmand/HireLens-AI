/**
 * Google sign-in — client half.
 *
 * The popup gives us a Firebase ID token, which we hand to POST /api/auth/google.
 * The server verifies that token against Google before it will mint a HireLens
 * session, so nothing here is trusted on its own.
 *
 * On the config values: a Firebase web apiKey is a public project identifier,
 * not a credential — it grants no access by itself. It still lives in env vars
 * rather than in the source so that each deployment points at its own project.
 * The real secret (the service-account private key) is server-side only.
 *
 * The SDK is imported dynamically inside the click handler so that it is never
 * part of the initial bundle — visitors who never press the button never pay for it.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Whether to show the Google button at all. When a deployment hasn't set the
 * VITE_FIREBASE_* variables we hide it rather than render a button that can only
 * fail — no dead controls.
 */
export const isGoogleSignInAvailable = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

/** Thrown when the user simply closed the popup — the caller stays silent. */
export class GoogleSignInCancelled extends Error {
  constructor() {
    super("Google sign-in was cancelled.");
    this.name = "GoogleSignInCancelled";
  }
}

const FRIENDLY_ERRORS = {
  "auth/popup-blocked":
    "Your browser blocked the Google popup. Allow popups for this site and try again.",
  "auth/unauthorized-domain":
    "This site isn't authorised for Google sign-in yet. Please use your email and password.",
  "auth/network-request-failed":
    "We couldn't reach Google. Check your connection and try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with that email. Sign in with your password instead.",
};

/**
 * Open the Google popup and return a fresh Firebase ID token.
 * @returns {Promise<string>} the ID token to POST to /api/auth/google
 */
export async function signInWithGoogle() {
  if (!isGoogleSignInAvailable) {
    throw new Error("Google sign-in isn't configured for this site.");
  }

  const [{ initializeApp, getApps, getApp }, authModule] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);

  const {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    inMemoryPersistence,
    signOut,
  } = authModule;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // The HireLens httpOnly cookie is the one and only session. Keeping Firebase's
  // own session in memory means we don't leave a second, longer-lived identity
  // sitting in the browser's storage after the user logs out of HireLens.
  await setPersistence(auth, inMemoryPersistence);

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  let result;
  try {
    result = await signInWithPopup(auth, provider);
  } catch (error) {
    const code = error?.code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      throw new GoogleSignInCancelled();
    }
    throw new Error(
      FRIENDLY_ERRORS[code] || "Google sign-in didn't work. Please try again."
    );
  }

  const idToken = await result.user.getIdToken();

  // We have what we need; drop the Firebase session immediately.
  try {
    await signOut(auth);
  } catch {
    // Non-fatal: persistence is in-memory anyway.
  }

  return idToken;
}

"use strict";
/**
 * Firebase Admin — used ONLY to verify Google ID tokens.
 *
 * MongoDB remains the primary database and the HireLens JWT remains the only
 * session mechanism. Firebase never stores application data here; it is the
 * identity provider we check the token against, nothing more.
 *
 * Why verify server-side at all: a client can send us any email it likes. The
 * only thing that proves "this person really controls this Google account" is a
 * signed ID token checked against Google's public keys — which is what
 * `verifyIdToken` does.
 *
 * Google sign-in is OPTIONAL. If the FIREBASE_* variables are absent the rest
 * of the app boots and email/password auth works exactly as before.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGoogleAuthConfigured = void 0;
exports.verifyGoogleIdToken = void 0;

const env_1 = require("./env");

let cachedAuth = null;

/** True when the server has credentials to verify Google tokens with. */
const isGoogleAuthConfigured = () =>
    Boolean(env_1.env.FIREBASE_PROJECT_ID && env_1.env.FIREBASE_CLIENT_EMAIL && env_1.env.FIREBASE_PRIVATE_KEY);
exports.isGoogleAuthConfigured = isGoogleAuthConfigured;

/**
 * Lazily initialise the Admin SDK. Lazy on purpose: `firebase-admin` is only
 * required when Google sign-in is actually configured and used, so a deployment
 * that never enables it doesn't pay for the dependency at boot.
 */
function getFirebaseAuth() {
    if (cachedAuth)
        return cachedAuth;

    let admin;
    try {
        admin = require('firebase-admin');
    }
    catch (err) {
        throw new Error(
            'Google sign-in is configured but the "firebase-admin" package is not installed. ' +
            'Run `npm install` in the backend directory.'
        );
    }

    // The private key arrives from .env with literal "\n" sequences.
    const privateKey = String(env_1.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n');

    const app = admin.apps && admin.apps.length
        ? admin.apps[0]
        : admin.initializeApp({
            credential: admin.credential.cert({
                projectId: env_1.env.FIREBASE_PROJECT_ID,
                clientEmail: env_1.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });

    cachedAuth = admin.auth(app);
    return cachedAuth;
}

/**
 * Verify a Firebase ID token that came from a Google popup sign-in.
 *
 * Returns the trustworthy subset of the token's claims. Throws a plain Error
 * with a user-safe message on any failure — the caller wraps it in an AppError.
 *
 * Two checks beyond the signature matter:
 *   1. `sign_in_provider === 'google.com'` — without it, anyone who could create
 *      an email/password account in the same Firebase project could mint a token
 *      for an arbitrary address and take over the matching HireLens account.
 *   2. `email_verified` — Google always sets this for real Google accounts, so a
 *      false value means the token did not come from the flow we expect.
 */
async function verifyGoogleIdToken(idToken) {
    if (!idToken || typeof idToken !== 'string') {
        throw new Error('No Google sign-in token was provided.');
    }

    const auth = getFirebaseAuth();

    let decoded;
    try {
        // checkRevoked = true: a token from a disabled/signed-out account is rejected.
        decoded = await auth.verifyIdToken(idToken, true);
    }
    catch (err) {
        const code = err && err.code;
        if (code === 'auth/id-token-expired' || code === 'auth/id-token-revoked') {
            throw new Error('Your Google sign-in expired. Please try again.');
        }
        throw new Error('We could not verify that Google sign-in. Please try again.');
    }

    const provider = decoded.firebase && decoded.firebase.sign_in_provider;
    if (provider !== 'google.com') {
        throw new Error('That sign-in did not come from Google.');
    }
    if (!decoded.email) {
        throw new Error('Your Google account did not share an email address.');
    }
    if (decoded.email_verified === false) {
        throw new Error('Your Google email address is not verified.');
    }

    return {
        googleId: decoded.uid,
        email: String(decoded.email).toLowerCase().trim(),
        fullName: (decoded.name || '').trim(),
        photoUrl: decoded.picture || null,
    };
}
exports.verifyGoogleIdToken = verifyGoogleIdToken;

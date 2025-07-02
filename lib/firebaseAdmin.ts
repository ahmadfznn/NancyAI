import type { ServiceAccount } from "firebase-admin";
import serviceAccount from "../firebase-service-account.json";

let adminAuth: ReturnType<typeof import("firebase-admin").auth>;
let adminDb: ReturnType<typeof import("firebase-admin").firestore>;

(async () => {
  const admin = await import("firebase-admin");

  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
      });
      console.log("✅ Firebase Admin SDK initialized.");
    } catch (err) {
      console.error("🔥 Firebase Admin SDK init error:", err);
    }
  }

  adminAuth = admin.auth();
  adminDb = admin.firestore();
})();

export { adminAuth, adminDb };

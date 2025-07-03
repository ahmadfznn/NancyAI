import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import path from "path";

const serviceAccountPath = path.resolve(
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH!
);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

let app: App;

if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
} else {
  app = getApps()[0];
}

const auth = getAdminAuth(app);

export { auth };

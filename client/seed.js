import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJ8LPot0WLtCxehvgHa9dMpTjWbaozSQM",
  authDomain: "snaplicaphoto.firebaseapp.com",
  projectId: "snaplicaphoto",
  storageBucket: "snaplicaphoto.firebasestorage.app",
  messagingSenderId: "84640464540",
  appId: "1:84640464540:web:f025795575dba8eb57f759",
  measurementId: "G-ZRYL99PCJX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const adminEmail = "snaplica@gmail.com";
const adminPassword = "snaplica@522601";

const seed = async () => {
  console.log(`[Seed] Initiating admin user registration...`);
  try {
    let uid;
    try {
      const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      uid = cred.user.uid;
      console.log(`[Seed] Auth account registered. UID: ${uid}`);
    } catch (e) {
      if (e.code === "auth/email-already-in-use") {
        console.log(`[Seed] Email already exists in Auth. Signing in to get UID...`);
        const cred2 = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        uid = cred2.user.uid;
        console.log(`[Seed] Signed in. UID: ${uid}`);
      } else {
        throw e;
      }
    }

    await setDoc(doc(db, "users", uid), {
      email: adminEmail,
      name: "Snaplica Admin",
      role: "admin",
      tenantId: "snaplica",
      createdAt: new Date().toISOString()
    }, { merge: true });

    console.log(`[Seed] Firestore document users/${uid} written/updated with role: admin.`);
    console.log(`\n🎉 Success! Seeding finished.`);
  } catch (err) {
    console.error("[Seed] ERROR:", err.message);
  }
};

seed();

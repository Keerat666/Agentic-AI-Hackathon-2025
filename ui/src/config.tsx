        // src/firebaseConfig.js
        import { initializeApp } from 'firebase/app';
        import { getFirestore } from 'firebase/firestore';
        import { collection, doc, setDoc } from "firebase/firestore"; 

        const firebaseConfig = {
            apiKey: import.meta.env.VITE_apiKey!,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
            measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
        };

        console.log(firebaseConfig)

        const app = initializeApp(firebaseConfig);
        console.log(app)
        const db = getFirestore(app);
        console.log(db)
        const citiesRef = collection(db, "cities");
        await setDoc(doc(citiesRef, "SF"), {
          name: "San Francisco", state: "CA", country: "USA",
          capital: false, population: 860000,
          regions: ["west_coast", "norcal"] });
        export default db;

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAKjZneb_kkHxUL88-AmWdOHUNplDWhZww",
    authDomain: "feruza-boutique.firebaseapp.com",
    projectId: "feruza-boutique",
    storageBucket: "feruza-boutique.firebasestorage.app",
    messagingSenderId: "424290712406",
    appId: "1:424290712406:web:4bbc42c7721260ff5374f7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
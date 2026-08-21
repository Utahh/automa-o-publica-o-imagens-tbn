// Inicialização do Firebase (leitura de dados no frontend)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "tbn-imoveis-site",
  appId: "1:442425683386:web:a51fa9850c06d793b48183",
  storageBucket: "tbn-imoveis-site.firebasestorage.app",
  apiKey: "AIzaSyCSotufAoDbxdTRHa0GB7d2v7cLdRQYwmo",
  authDomain: "tbn-imoveis-site.firebaseapp.com",
  messagingSenderId: "442425683386",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);

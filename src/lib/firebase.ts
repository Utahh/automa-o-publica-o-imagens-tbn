// Inicialização do Firebase (leitura de dados + autenticação no frontend).
// Fotos ficam no Cloudinary (URLs públicas salvas direto no Firestore),
// não no Firebase Storage — por isso não há SDK de Storage aqui.
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "tbn-imoveis-site",
  appId: "1:442425683386:web:a51fa9850c06d793b48183",
  apiKey: "AIzaSyCSotufAoDbxdTRHa0GB7d2v7cLdRQYwmo",
  authDomain: "tbn-imoveis-site.firebaseapp.com",
  messagingSenderId: "442425683386",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

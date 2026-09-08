// ============================================================
// CONFIGURACIÓN DE FIREBASE
// ============================================================
// 1. Andá a https://console.firebase.google.com/
// 2. Creá un proyecto nuevo (es gratis).
// 3. Dentro del proyecto: "Compilación" > "Firestore Database" > "Crear base de datos"
//    (elegí modo de producción, cualquier región cercana).
// 4. En "Reglas" de Firestore, pegá esto para que cualquiera pueda leer y
//    escribir recetas (ya que decidiste que sea público, sin login):
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /recetas/{recetaId} {
//          allow read: if true;
//          allow create: if true
//            && request.resource.data.titulo is string
//            && request.resource.data.titulo.size() > 0
//            && request.resource.data.titulo.size() < 100;
//          allow update, delete: if false;
//        }
//      }
//    }
//
// 5. En el ícono de engranaje > "Configuración del proyecto" > bajá hasta
//    "Tus apps" > ícono "</>" (Web) > registrá la app.
// 6. Firebase te va a mostrar un objeto "firebaseConfig". Copialo y pegalo
//    reemplazando el de abajo.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDG2a4P2Y2_kNpJUVy0GZxGpeIMgogGIVQ",
  authDomain: "recetario-e1b40.firebaseapp.com",
  projectId: "recetario-e1b40",
  storageBucket: "recetario-e1b40.firebasestorage.app",
  messagingSenderId: "716145515505",
  appId: "1:716145515505:web:66976ceb0c122ca7e64250"
};

// ============================================================
// CONFIGURACIÓN DE IMGBB (para subir las fotos)
// ============================================================
// 1. Andá a https://api.imgbb.com/ y creá una cuenta gratis.
// 2. Te da una API KEY. Pegala abajo.
// ============================================================
export const IMGBB_API_KEY = "017f10cce0c9aa56de71ffe84833270f";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

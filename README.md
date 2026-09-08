# Nuestro Recetario 🍳

Página web para subir y guardar recetas con fotos, estilo brutalista y responsive.
Cualquiera con el link puede subir una receta (no tiene login), pensado para que
ustedes dos la usen libremente.

## Archivos

- `index.html` — estructura de la página
- `styles.css` — todo el estilo brutalista
- `app.js` — lógica: guardar/leer recetas, subir fotos, filtros
- `firebase-config.js` — acá van tus credenciales (Firebase + ImgBB)

## Paso 1: Crear proyecto de Firebase (gratis)

1. Andá a https://console.firebase.google.com/ y creá un proyecto nuevo.
2. En el menú lateral: **Compilación > Firestore Database > Crear base de datos**.
   Elegí "modo de producción" y la región más cercana (ej. `southamerica-east1`).
3. Andá a la pestaña **Reglas** de Firestore y reemplazá el contenido por:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /recetas/{recetaId} {
         allow read: if true;
         allow create: if true
           && request.resource.data.titulo is string
           && request.resource.data.titulo.size() > 0
           && request.resource.data.titulo.size() < 100;
         allow update, delete: if false;
       }
     }
   }
   ```

   Esto permite que cualquiera lea y cree recetas, pero nadie pueda editar o
   borrar las de otro (ni siquiera desde la consola del navegador).

4. Andá al ícono de engranaje (arriba a la izquierda) > **Configuración del
   proyecto** > bajá hasta "Tus apps" > clickeá el ícono `</>` (Web) para
   registrar una app.
5. Copiá el objeto `firebaseConfig` que te muestra y pegalo en
   `firebase-config.js`, reemplazando los valores de ejemplo.

## Paso 2: Crear cuenta en ImgBB (gratis, para las fotos)

1. Andá a https://api.imgbb.com/ y registrate.
2. Te va a dar una **API Key**.
3. Pegala en `firebase-config.js`, en la constante `IMGBB_API_KEY`.

## Paso 3: Probar en tu computadora

Como el archivo usa módulos de JavaScript (`type="module"`), no podés abrir
`index.html` haciendo doble click — hay que servirlo con un mini servidor local.

Con Python instalado, desde la carpeta del proyecto:

```
python -m http.server 8000
```

Y abrís `http://localhost:8000` en el navegador.

O con la extensión **Live Server** de VS Code, botón derecho sobre
`index.html` > "Open with Live Server".

## Paso 4: Publicarla online (para que la usen desde el celular)

La forma más simple, ya que usás Firebase:

1. Instalá Firebase CLI: `npm install -g firebase-tools`
2. `firebase login`
3. Desde la carpeta del proyecto: `firebase init hosting`
   - Elegí tu proyecto de Firebase
   - Directorio público: `.` (la carpeta actual)
   - Configurar como single-page app: `No`
4. `firebase deploy`

Te va a dar una URL tipo `https://tu-proyecto.web.app` que pueden compartir
entre ustedes.

(Alternativa igual de fácil: Netlify o Vercel, arrastrando la carpeta del
proyecto a su web — también gratis.)

## Cómo funciona

- **Subir receta**: botón "+ SUBIR RECETA" abre un formulario con título,
  quién la sube, categoría, ingredientes, pasos y una foto opcional.
- La foto se sube a ImgBB (servicio externo, gratis) y se guarda solo el link
  en Firestore, junto con el resto de los datos.
- Las recetas se muestran en una galería con tarjetas; al hacer click se abre
  el detalle completo.
- Hay un buscador (por título o autor) y un filtro por categoría.
- Todo se actualiza en tiempo real: si uno sube una receta, el otro la ve
  aparecer sin recargar la página.

## Notas

- Como no hay login, cualquiera con el link puede subir una receta. Si más
  adelante quieren agregar un login simple para ustedes dos, avisen y lo
  sumamos con Firebase Authentication.
- Las recetas no se pueden borrar ni editar desde la web todavía (las reglas
  de Firestore lo bloquean a propósito, para que nadie borre sin querer). Si
  quieren esa función, es un agregado chico.

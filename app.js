import { db, IMGBB_API_KEY } from "./firebase-config.js";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ------------------------------------------------------------
// Referencias al DOM
// ------------------------------------------------------------
const galeria = document.getElementById("galeria");
const estadoCarga = document.getElementById("estado-carga");
const sinResultados = document.getElementById("sin-resultados");
const buscador = document.getElementById("buscador");
const filtroCategoria = document.getElementById("filtro-categoria");

const modalForm = document.getElementById("modal-form");
const modalDetalle = document.getElementById("modal-detalle");
const detalleContenido = document.getElementById("detalle-contenido");
const btnNuevaReceta = document.getElementById("btn-nueva-receta");
const formReceta = document.getElementById("form-receta");
const btnGuardar = document.getElementById("btn-guardar");
const formError = document.getElementById("form-error");

const inputFoto = document.getElementById("input-foto");
const previewFoto = document.getElementById("preview-foto");

// ------------------------------------------------------------
// Estado local
// ------------------------------------------------------------
let recetas = []; // todas las recetas traídas de Firestore

// ------------------------------------------------------------
// Modales
// ------------------------------------------------------------
function abrirModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}
function cerrarModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => cerrarModal(document.getElementById(btn.dataset.close)));
});
[modalForm, modalDetalle].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal(modal);
  });
});

btnNuevaReceta.addEventListener("click", () => {
  formReceta.reset();
  previewFoto.hidden = true;
  formError.hidden = true;
  abrirModal(modalForm);
});

// Preview de la imagen elegida
inputFoto.addEventListener("change", () => {
  const file = inputFoto.files[0];
  if (!file) {
    previewFoto.hidden = true;
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    previewFoto.src = e.target.result;
    previewFoto.hidden = false;
  };
  reader.readAsDataURL(file);
});

// ------------------------------------------------------------
// Subida de imagen a ImgBB
// ------------------------------------------------------------
async function subirImagenAImgBB(file) {
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const formData = new FormData();
  formData.append("image", base64);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  if (!data.success) {
    throw new Error("No se pudo subir la imagen a ImgBB");
  }
  return data.data.url;
}

// ------------------------------------------------------------
// Guardar receta nueva
// ------------------------------------------------------------
formReceta.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;
  btnGuardar.disabled = true;
  btnGuardar.textContent = "GUARDANDO...";

  try {
    const titulo = document.getElementById("input-titulo").value.trim();
    const autor = document.getElementById("input-autor").value.trim();
    const categoria = document.getElementById("input-categoria").value;
    const ingredientes = document.getElementById("input-ingredientes").value
      .split("\n").map((l) => l.trim()).filter(Boolean);
    const pasos = document.getElementById("input-pasos").value
      .split("\n").map((l) => l.trim()).filter(Boolean);

    if (!titulo || !autor || ingredientes.length === 0 || pasos.length === 0) {
      throw new Error("Completá todos los campos obligatorios.");
    }

    let fotoUrl = "";
    const file = inputFoto.files[0];
    if (file) {
      btnGuardar.textContent = "SUBIENDO FOTO...";
      fotoUrl = await subirImagenAImgBB(file);
    }

    btnGuardar.textContent = "GUARDANDO...";
    await addDoc(collection(db, "recetas"), {
      titulo,
      autor,
      categoria: categoria || "otro",
      ingredientes,
      pasos,
      fotoUrl,
      creadoEn: serverTimestamp()
    });

    cerrarModal(modalForm);
  } catch (err) {
    formError.textContent = err.message || "Ocurrió un error al guardar la receta.";
    formError.hidden = false;
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = "GUARDAR RECETA";
  }
});

// ------------------------------------------------------------
// Escuchar recetas en tiempo real
// ------------------------------------------------------------
const q = query(collection(db, "recetas"), orderBy("creadoEn", "desc"));

onSnapshot(
  q,
  (snapshot) => {
    estadoCarga.hidden = true;
    recetas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderGaleria();
  },
  (error) => {
    estadoCarga.textContent = "ERROR AL CARGAR RECETAS. REVISÁ LA CONFIGURACIÓN DE FIREBASE.";
    console.error(error);
  }
);

// ------------------------------------------------------------
// Render de la galería (con filtros)
// ------------------------------------------------------------
function renderGaleria() {
  const textoBusqueda = buscador.value.trim().toLowerCase();
  const categoriaSeleccionada = filtroCategoria.value;

  const recetasFiltradas = recetas.filter((r) => {
    const coincideTexto = !textoBusqueda || r.titulo.toLowerCase().includes(textoBusqueda)
      || (r.autor || "").toLowerCase().includes(textoBusqueda);
    const coincideCategoria = !categoriaSeleccionada || r.categoria === categoriaSeleccionada;
    return coincideTexto && coincideCategoria;
  });

  galeria.innerHTML = "";

  if (recetasFiltradas.length === 0) {
    sinResultados.hidden = false;
    return;
  }
  sinResultados.hidden = true;

  recetasFiltradas.forEach((receta) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card-imagen">
        ${receta.fotoUrl
          ? `<img src="${receta.fotoUrl}" alt="${escapeHtml(receta.titulo)}" loading="lazy">`
          : `<div class="card-imagen-placeholder">SIN FOTO</div>`}
        <span class="card-categoria">${(receta.categoria || "otro").toUpperCase()}</span>
      </div>
      <div class="card-body">
        <h3 class="card-titulo">${escapeHtml(receta.titulo)}</h3>
        <p class="card-autor">POR ${escapeHtml((receta.autor || "").toUpperCase())}</p>
      </div>
    `;
    card.addEventListener("click", () => mostrarDetalle(receta));
    galeria.appendChild(card);
  });
}

buscador.addEventListener("input", renderGaleria);
filtroCategoria.addEventListener("change", renderGaleria);

// ------------------------------------------------------------
// Detalle de receta
// ------------------------------------------------------------
function mostrarDetalle(receta) {
  detalleContenido.innerHTML = `
    ${receta.fotoUrl ? `<img src="${receta.fotoUrl}" class="detalle-imagen" alt="${escapeHtml(receta.titulo)}">` : ""}
    <span class="card-categoria detalle-categoria">${(receta.categoria || "otro").toUpperCase()}</span>
    <h2 class="detalle-titulo">${escapeHtml(receta.titulo)}</h2>
    <p class="detalle-autor">RECETA DE ${escapeHtml((receta.autor || "").toUpperCase())}</p>

    <h3 class="detalle-subtitulo">INGREDIENTES</h3>
    <ul class="detalle-lista">
      ${receta.ingredientes.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}
    </ul>

    <h3 class="detalle-subtitulo">PREPARACIÓN</h3>
    <ol class="detalle-lista detalle-pasos">
      ${receta.pasos.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
    </ol>
  `;
  abrirModal(modalDetalle);
}

// ------------------------------------------------------------
// Utilidad: escapar HTML para evitar inyección al mostrar texto
// ------------------------------------------------------------
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

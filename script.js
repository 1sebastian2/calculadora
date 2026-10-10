// ---------- Constantes ----------
const PESO_SACO_CEMENTO = 50;
const DESPERDICIO = 1.00;

// Tabla de dosificación por m³: c = cemento (kg), a = arena (m³), g = grava (m³), w = agua (L)
const DOSIFICACIONES = {
  4000: { c: 420, a: 0.67, g: 0.67, w: 190 },
  3555: { c: 380, a: 0.60, g: 0.76, w: 180 },
  3224: { c: 350, a: 0.56, g: 0.84, w: 180 },  
  3000: { c: 320, a: 0.52, g: 0.90, w: 165 },
  2850: { c: 300, a: 0.48, g: 0.95, w: 158 },
  2700: { c: 280, a: 0.55, g: 0.89, w: 158 },
  2400: { c: 240, a: 0.60, g: 0.85, w: 158 },
  2275: { c: 260, a: 0.63, g: 0.83, w: 160 },
  2000: { c: 230, a: 0.55, g: 0.92, w: 148 },
  1700: { c: 210, a: 0.50, g: 1.00, w: 143 },
  1560: { c: 175, a: 0.55, g: 0.98, w: 133 },
  1420: { c: 160, a: 0.55, g: 1.03, w: 125 }
};

// Tipos de elemento: nombre, campos y fórmula del volumen (m³)
const TIPOS = {
  losa: {
    nombre: "Losa",
    campos: ["Largo (m)", "Ancho (m)", "Espesor (cm)"],
    volumen: (a) => a[0] * a[1] * (a[2] / 100)
  },
  colr: {
    nombre: "Columna rectangular",
    campos: ["Base (cm)", "Ancho (cm)", "Altura (m)"],
    volumen: (a) => (a[0] / 100) * (a[1] / 100) * a[2]
  },
  colc: {
    nombre: "Columna cilíndrica",
    campos: ["Radio (m)", "Altura (m)"],
    volumen: (a) => Math.PI * a[0] ** 2 * a[1]
  },
  viga: {
    nombre: "Viga",
    campos: ["Base (cm)", "Altura (cm)", "Largo (m)"],
    volumen: (a) => (a[0] / 100) * (a[1] / 100) * a[2]
  }
};

// ---------- Estado y utilidades ----------
let elementos = [];
const $ = (id) => document.getElementById(id);

// Acepta coma o punto decimal (equivale a limpiar() en Python)
function limpiar(valor) {
  return parseFloat(String(valor).replace(",", "."));
}

// ---------- Interfaz ----------
function cargarSelects() {
  Object.keys(DOSIFICACIONES)
    .map(Number)
    .sort((a, b) => b - a)
    .forEach((p) => {
      const o = document.createElement("option");
      o.value = p;
      o.textContent = p + " PSI";
      $("psi").appendChild(o);
    });

  Object.entries(TIPOS).forEach(([clave, t]) => {
    const o = document.createElement("option");
    o.value = clave;
    o.textContent = t.nombre;
    $("tipo").appendChild(o);
  });
}

function mostrarCampos() {
  const t = TIPOS[$("tipo").value];
  $("campos").innerHTML = t.campos
    .map((etiqueta, i) =>
      `<div><label>${etiqueta}</label><input id="f${i}" inputmode="decimal" placeholder="0"></div>`)
    .join("");
}

function mostrarLista() {
  if (elementos.length === 0) {
    $("lista").innerHTML = '<p class="s">Aún no hay elementos.</p>';
    return;
  }
  $("lista").innerHTML = elementos
    .map((e, i) =>
      `<div class="it">
         <span>${TIPOS[e.tipo].nombre} — ${e.volumen.toFixed(2)} m³</span>
         <button class="sec" onclick="quitar(${i})">Quitar</button>
       </div>`)
    .join("");
}

function quitar(i) {
  elementos.splice(i, 1);
  mostrarLista();
}

// ---------- Acciones ----------
function agregar() {
  const tipo = $("tipo").value;
  const t = TIPOS[tipo];
  const valores = t.campos.map((_, i) => limpiar($("f" + i).value));

  if (valores.some((v) => isNaN(v) || v <= 0)) {
    $("err").textContent = "Completa todas las medidas con números mayores que 0.";
    return;
  }
  $("err").textContent = "";
  elementos.push({ tipo, volumen: t.volumen(valores) });
  mostrarCampos();
  mostrarLista();
}

function calcular() {
  if (elementos.length === 0) {
    $("err").textContent = "Agrega al menos un elemento.";
    return;
  }
  $("err").textContent = "";

  const d = DOSIFICACIONES[$("psi").value];
  const volumenNeto = elementos.reduce((suma, e) => suma + e.volumen, 0);
  const volumenTotal = volumenNeto * DESPERDICIO;

  const cemento = d.c * volumenTotal;
  const sacos = cemento / PESO_SACO_CEMENTO;
  const arena = d.a * volumenTotal;
  const grava = d.g * volumenTotal;
  const litros = d.w * volumenTotal;

  const fila = (texto, valor) =>
    `<div class="r"><span>${texto}</span><b>${valor}</b></div>`;

  $("res").innerHTML =
    "<b>Resultados</b>" +
    fila("Volumen neto", volumenNeto.toFixed(2) + " m³") +
    fila("Volumen con desperdicio (5 %)", volumenTotal.toFixed(2) + " m³") +
    fila("Resistencia", $("psi").value + " PSI") +
    fila("Sacos de cemento de 50 kg", sacos.toFixed(1)) +
    fila("Arena", arena.toFixed(2) + " m³") +
    fila("Grava", grava.toFixed(2) + " m³") +
    fila("Agua", litros.toFixed(1) + " L");

  $("res").style.display = "block";
  $("res").scrollIntoView({ behavior: "smooth" });
}

function limpiarTodo() {
  elementos = [];
  mostrarLista();
  $("res").style.display = "none";
}

// ---------- Inicio ----------
cargarSelects();
mostrarCampos();
mostrarLista();
$("tipo").addEventListener("change", mostrarCampos);
$("add").addEventListener("click", agregar);
$("calc").addEventListener("click", calcular);
$("clr").addEventListener("click", limpiarTodo);

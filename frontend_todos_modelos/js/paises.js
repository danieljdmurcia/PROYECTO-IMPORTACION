// js/paises.js

const API_BASE = "https://proyecto-importacion-2.onrender.com/paises.html";


const paisesBody = document.getElementById("paisesBody");
const buscarInput = document.getElementById("buscar");
const form = document.getElementById("paisForm");
const limpiarBtn = document.getElementById("limpiarBtn");

let paises = [];
let editandoId = null;

// =====================================================
// Cargar países
// =====================================================
async function cargarPaises() {
    try {
        const resp = await fetch(`${API_BASE}/paises/`);
        if (!resp.ok) throw new Error("Error cargando países");
        paises = await resp.json();
        mostrarPaises(paises);
    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los países.");
    }
}

// =====================================================
// Mostrar países en tabla
// =====================================================
function mostrarPaises(lista) {
    paisesBody.innerHTML = "";

    if (!lista.length) {
        paisesBody.innerHTML = `
            <tr><td colspan="4">No hay países registrados.</td></tr>
        `;
        return;
    }

    lista.forEach((p) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.codigo ?? ""}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editarPais(${p.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarPais(${p.id})">Eliminar</button>
            </td>
        `;

        paisesBody.appendChild(tr);
    });
}

// =====================================================
// Crear o actualizar país
// =====================================================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById("nombre").value.trim(),
        codigo: document.getElementById("codigo").value.trim().toUpperCase() || null,
    };

    if (!data.nombre) {
        alert("El nombre del país es obligatorio.");
        return;
    }

    try {
        let resp;

        if (!editandoId) {
            // Crear
            resp = await fetch(`${API_BASE}/paises/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        } else {
            // Editar
            resp = await fetch(`${API_BASE}/paises/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            editandoId = null;
        }

        if (!resp.ok) throw new Error("Error al guardar país");

        form.reset();
        await cargarPaises();
        alert("País guardado correctamente");
    } catch (err) {
        console.error(err);
        alert("No se pudo guardar el país.");
    }
});

// =====================================================
// Editar país
// =====================================================
async function editarPais(id) {
    try {
        const resp = await fetch(`${API_BASE}/paises/${id}`);
        if (!resp.ok) throw new Error("No se pudo cargar el país");
        const pais = await resp.json();

        document.getElementById("nombre").value = pais.nombre ?? "";
        document.getElementById("codigo").value = pais.codigo ?? "";

        editandoId = pais.id;
    } catch (err) {
        console.error(err);
        alert("No se pudo cargar la información del país.");
    }
}

// =====================================================
// Eliminar país
// =====================================================
async function eliminarPais(id) {
    if (!confirm("¿Eliminar este país?")) return;

    try {
        const resp = await fetch(`${API_BASE}/paises/${id}`, {
            method: "DELETE",
        });

        if (!resp.ok) throw new Error("Error al eliminar");

        await cargarPaises();
        alert("País eliminado.");
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar el país.");
    }
}

// =====================================================
// Búsqueda dinámica
// =====================================================
buscarInput.addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase();

    const filtrados = paises.filter((p) => {
        const nombre = p.nombre.toLowerCase();
        const codigo = (p.codigo ?? "").toLowerCase();
        return nombre.includes(texto) || codigo.includes(texto);
    });

    mostrarPaises(filtrados);
});

// =====================================================
// Limpiar formulario
// =====================================================
limpiarBtn.addEventListener("click", () => {
    editandoId = null;
    form.reset();
});

// =====================================================
// Iniciar
// =====================================================
document.addEventListener("DOMContentLoaded", cargarPaises);

// Hacer accesibles las funciones
window.editarPais = editarPais;
window.eliminarPais = eliminarPais;

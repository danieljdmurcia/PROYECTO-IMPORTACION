// js/puertos.js

const API_BASE = "https://proyecto-importacion.onrender.com";


const puertosBody = document.getElementById("puertosBody");
const buscarInput = document.getElementById("buscar");
const form = document.getElementById("puertoForm");
const limpiarBtn = document.getElementById("limpiarBtn");

let puertos = [];
let editandoId = null;

// ===============================
// Cargar puertos
// ===============================
async function cargarPuertos() {
    try {
        const resp = await fetch(`${API_BASE}/puertos/`);
        if (!resp.ok) throw new Error("Error al cargar puertos");
        puertos = await resp.json();
        mostrarPuertos(puertos);
    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los puertos.");
    }
}

// ===============================
// Mostrar puertos en la tabla
// ===============================
function mostrarPuertos(lista) {
    puertosBody.innerHTML = "";

    if (!lista.length) {
        puertosBody.innerHTML = `
            <tr><td colspan="5">No hay puertos registrados.</td></tr>
        `;
        return;
    }

    lista.forEach((p) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.tipo ?? ""}</td>
            <td>${p.pais_id ?? "-"}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editarPuerto(${p.id})">
                    Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarPuerto(${p.id})">
                    Eliminar
                </button>
            </td>
        `;

        puertosBody.appendChild(tr);
    });
}

// ===============================
// Crear / actualizar puerto
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById("nombre").value.trim(),
        tipo: document.getElementById("tipo").value || null,
        pais_id: document.getElementById("pais_id").value
            ? Number(document.getElementById("pais_id").value)
            : null,
    };

    if (!data.nombre || !data.pais_id) {
        alert("Nombre y país son obligatorios.");
        return;
    }

    try {
        let resp;

        if (!editandoId) {
            // Crear
            resp = await fetch(`${API_BASE}/puertos/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        } else {
            // Actualizar
            resp = await fetch(`${API_BASE}/puertos/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            editandoId = null;
        }

        if (!resp.ok) {
            console.error(await resp.json().catch(() => null));
            throw new Error("Error al guardar puerto");
        }

        form.reset();
        await cargarPuertos();
        alert("Puerto guardado correctamente.");
    } catch (err) {
        console.error(err);
        alert("No se pudo guardar el puerto.");
    }
});

// ===============================
// Editar puerto (llenar formulario)
// ===============================
async function editarPuerto(id) {
    try {
        const resp = await fetch(`${API_BASE}/puertos/${id}`);
        if (!resp.ok) throw new Error("No se pudo obtener el puerto");
        const puerto = await resp.json();

        document.getElementById("nombre").value = puerto.nombre ?? "";
        document.getElementById("tipo").value = puerto.tipo ?? "";
        document.getElementById("pais_id").value = puerto.pais_id ?? "";

        editandoId = puerto.id;
    } catch (err) {
        console.error(err);
        alert("No se pudo cargar la información del puerto.");
    }
}

// ===============================
// Eliminar puerto
// ===============================
async function eliminarPuerto(id) {
    if (!confirm("¿Eliminar este puerto?")) return;

    try {
        const resp = await fetch(`${API_BASE}/puertos/${id}`, {
            method: "DELETE",
        });

        if (!resp.ok) throw new Error("Error al eliminar puerto");

        await cargarPuertos();
        alert("Puerto eliminado correctamente.");
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar el puerto.");
    }
}

// ===============================
// Búsqueda dinámica
// ===============================
buscarInput.addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase();

    const filtrados = puertos.filter((p) => {
        const nombre = p.nombre?.toLowerCase() ?? "";
        const tipo = p.tipo?.toLowerCase() ?? "";
        const paisId = String(p.pais_id ?? "");
        return (
            nombre.includes(texto) ||
            tipo.includes(texto) ||
            paisId.includes(texto)
        );
    });

    mostrarPuertos(filtrados);
});

// ===============================
// Limpiar formulario
// ===============================
limpiarBtn.addEventListener("click", () => {
    editandoId = null;
    form.reset();
});

// ===============================
// Iniciar
// ===============================
document.addEventListener("DOMContentLoaded", cargarPuertos);

// Exponer funciones globales
window.editarPuerto = editarPuerto;
window.eliminarPuerto = eliminarPuerto;

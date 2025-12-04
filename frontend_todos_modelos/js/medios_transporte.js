// js/medios_transporte.js

const API_BASE = "https://proyecto-importacion.onrender.com";


const mediosBody = document.getElementById("mediosBody");
const buscarInput = document.getElementById("buscar");
const form = document.getElementById("medioForm");
const limpiarBtn = document.getElementById("limpiarBtn");

let medios = [];
let editandoId = null;

// ===============================
// Cargar medios de transporte
// ===============================
async function cargarMedios() {
    try {
        const resp = await fetch(`${API_BASE}/medios-transporte/`);
        if (!resp.ok) throw new Error("Error al cargar medios de transporte");
        medios = await resp.json();
        mostrarMedios(medios);
    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los medios de transporte.");
    }
}

// ===============================
// Mostrar en tabla
// ===============================
function mostrarMedios(lista) {
    mediosBody.innerHTML = "";

    if (!lista.length) {
        mediosBody.innerHTML = `
            <tr><td colspan="4">No hay medios de transporte registrados.</td></tr>
        `;
        return;
    }

    lista.forEach((m) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${m.id}</td>
            <td>${m.tipo}</td>
            <td>${m.empresa ?? ""}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editarMedio(${m.id})">
                    Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarMedio(${m.id})">
                    Eliminar
                </button>
            </td>
        `;

        mediosBody.appendChild(tr);
    });
}

// ===============================
// Crear / Actualizar medio
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        tipo: document.getElementById("tipo").value,
        empresa: document.getElementById("empresa").value || null,
    };

    if (!data.tipo) {
        alert("El tipo de medio es obligatorio.");
        return;
    }

    try {
        if (!editandoId) {
            // Crear
            const resp = await fetch(`${API_BASE}/medios-transporte/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!resp.ok) {
                console.error(await resp.json().catch(() => null));
                throw new Error("Error al crear medio de transporte");
            }
        } else {
            // Actualizar
            const resp = await fetch(`${API_BASE}/medios-transporte/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!resp.ok) {
                console.error(await resp.json().catch(() => null));
                throw new Error("Error al actualizar medio de transporte");
            }

            editandoId = null;
        }

        form.reset();
        await cargarMedios();
        alert("Medio de transporte guardado correctamente.");
    } catch (err) {
        console.error(err);
        alert("No se pudo guardar el medio de transporte.");
    }
});

// ===============================
// Editar medio (llenar formulario)
// ===============================
async function editarMedio(id) {
    try {
        const resp = await fetch(`${API_BASE}/medios-transporte/${id}`);
        if (!resp.ok) throw new Error("No se pudo obtener el medio.");
        const medio = await resp.json();

        document.getElementById("tipo").value = medio.tipo ?? "";
        document.getElementById("empresa").value = medio.empresa ?? "";

        editandoId = medio.id;
    } catch (err) {
        console.error(err);
        alert("No se pudo cargar la información del medio de transporte.");
    }
}

// ===============================
// Eliminar medio
// ===============================
async function eliminarMedio(id) {
    if (!confirm("¿Seguro que deseas eliminar este medio de transporte?")) return;

    try {
        const resp = await fetch(`${API_BASE}/medios-transporte/${id}`, {
            method: "DELETE",
        });

        if (!resp.ok) throw new Error("Error al eliminar medio.");

        await cargarMedios();
        alert("Medio de transporte eliminado.");
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar el medio de transporte.");
    }
}

// ===============================
// Búsqueda en vivo
// ===============================
buscarInput.addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase();
    const filtrados = medios.filter((m) => {
        const tipo = m.tipo?.toLowerCase() ?? "";
        const empresa = m.empresa?.toLowerCase() ?? "";
        return tipo.includes(texto) || empresa.includes(texto);
    });
    mostrarMedios(filtrados);
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
document.addEventListener("DOMContentLoaded", cargarMedios);

// Exponer funciones globalmente
window.editarMedio = editarMedio;
window.eliminarMedio = eliminarMedio;

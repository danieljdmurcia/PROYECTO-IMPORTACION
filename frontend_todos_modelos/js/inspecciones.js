// js/inspecciones.js
const API_BASE = "https://proyecto-importacion.onrender.com";


const inspeccionesBody = document.getElementById("inspeccionesBody");
const buscarInput = document.getElementById("buscar");
const form = document.getElementById("inspeccionForm");
const limpiarBtn = document.getElementById("limpiarBtn");

let inspecciones = [];
let editandoId = null;

function alertar(mensaje) {
    alert(mensaje);
}

// ===============================
// Cargar inspecciones
// ===============================
async function cargarInspecciones() {
    try {
        const resp = await fetch(`${API_BASE}/inspecciones/`);
        if (!resp.ok) throw new Error("Error al cargar inspecciones");
        inspecciones = await resp.json();
        renderInspecciones(inspecciones);
    } catch (err) {
        console.error(err);
        alertar("No se pudieron cargar las inspecciones.");
    }
}

// ===============================
// Render tabla
// ===============================
function renderInspecciones(lista) {
    inspeccionesBody.innerHTML = "";

    if (!lista.length) {
        inspeccionesBody.innerHTML = `
            <tr><td colspan="7">No hay inspecciones registradas.</td></tr>
        `;
        return;
    }

    for (const ins of lista) {
        const tr = document.createElement("tr");

        const badgeClass =
            ins.resultado === "Aprobado"
                ? "badge-success"
                : ins.resultado === "Rechazado"
                ? "badge-danger"
                : "badge-warning";

        tr.innerHTML = `
            <td>${ins.id}</td>
            <td>${ins.fecha ?? ""}</td>
            <td>
                <span class="badge ${badgeClass}">
                    ${ins.resultado}
                </span>
            </td>
            <td>${ins.operacion_id}</td>
            <td>${ins.producto_id ?? "-"}</td>
            <td>${ins.observaciones ?? ""}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editarInspeccion(${ins.id})">
                    Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarInspeccion(${ins.id})">
                    Eliminar
                </button>
            </td>
        `;

        inspeccionesBody.appendChild(tr);
    }
}

// ===============================
// Crear / actualizar inspección
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        fecha: document.getElementById("fecha").value,
        resultado: document.getElementById("resultado").value,
        observaciones: document.getElementById("observaciones").value || null,
        operacion_id: document.getElementById("operacion_id").value
            ? Number(document.getElementById("operacion_id").value)
            : null,
        producto_id: document.getElementById("producto_id").value
            ? Number(document.getElementById("producto_id").value)
            : null,
    };

    if (!data.fecha || !data.resultado || !data.operacion_id) {
        alertar("Fecha, resultado y operación son obligatorios.");
        return;
    }

    try {
        let resp;
        if (!editandoId) {
            // Crear
            resp = await fetch(`${API_BASE}/inspecciones/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        } else {
            // Actualizar
            resp = await fetch(`${API_BASE}/inspecciones/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            editandoId = null;
        }

        if (!resp.ok) {
            console.error(await resp.json().catch(() => null));
            throw new Error("Error al guardar inspección");
        }

        form.reset();
        await cargarInspecciones();
        alertar("Inspección guardada correctamente.");
    } catch (err) {
        console.error(err);
        alertar("No se pudo guardar la inspección.");
    }
});

// ===============================
// Editar inspección
// ===============================
async function editarInspeccion(id) {
    try {
        const resp = await fetch(`${API_BASE}/inspecciones/${id}`);
        if (!resp.ok) throw new Error("No se pudo obtener la inspección");

        const ins = await resp.json();

        document.getElementById("fecha").value = ins.fecha ?? "";
        document.getElementById("resultado").value = ins.resultado ?? "";
        document.getElementById("observaciones").value = ins.observaciones ?? "";
        document.getElementById("operacion_id").value = ins.operacion_id ?? "";
        document.getElementById("producto_id").value = ins.producto_id ?? "";

        editandoId = ins.id;
    } catch (err) {
        console.error(err);
        alertar("No se pudo cargar la información de la inspección.");
    }
}

// ===============================
// Eliminar inspección
// ===============================
async function eliminarInspeccion(id) {
    if (!confirm("¿Eliminar esta inspección?")) return;

    try {
        const resp = await fetch(`${API_BASE}/inspecciones/${id}`, {
            method: "DELETE",
        });

        if (!resp.ok) throw new Error("Error al eliminar inspección");

        await cargarInspecciones();
        alertar("Inspección eliminada correctamente.");
    } catch (err) {
        console.error(err);
        alertar("No se pudo eliminar la inspección.");
    }
}

// ===============================
// Búsqueda
// ===============================
buscarInput.addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase();

    const filtradas = inspecciones.filter((ins) => {
        const idStr = String(ins.id);
        const resultado = ins.resultado?.toLowerCase() ?? "";
        const operacionStr = String(ins.operacion_id ?? "");
        return (
            idStr.includes(texto) ||
            resultado.includes(texto) ||
            operacionStr.includes(texto)
        );
    });

    renderInspecciones(filtradas);
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
document.addEventListener("DOMContentLoaded", cargarInspecciones);

// Exponer funciones al ámbito global
window.editarInspeccion = editarInspeccion;
window.eliminarInspeccion = eliminarInspeccion;

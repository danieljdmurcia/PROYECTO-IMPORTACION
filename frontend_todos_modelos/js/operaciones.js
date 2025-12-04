// js/operaciones.js

const API_BASE = "https://proyecto-importacion.onrender.com";


const operacionesBody = document.getElementById("operacionesBody");
const buscarInput = document.getElementById("buscar");
const form = document.getElementById("operacionForm");
const limpiarBtn = document.getElementById("limpiarBtn");

let operaciones = [];

// ===============================
// Utilidad para mostrar mensajes
// ===============================
function alerta(msg) {
    alert(msg);
}

// ===============================
// Cargar operaciones
// ===============================
async function cargarOperaciones() {
    try {
        const resp = await fetch(`${API_BASE}/operaciones/`);
        if (!resp.ok) throw new Error("Error al cargar operaciones");
        operaciones = await resp.json();
        renderOperaciones(operaciones);
    } catch (err) {
        console.error(err);
        alerta("No se pudieron cargar las operaciones.");
    }
}

// ===============================
// Render tabla
// ===============================
function renderOperaciones(lista) {
    operacionesBody.innerHTML = "";

    if (!lista.length) {
        operacionesBody.innerHTML = `
            <tr><td colspan="11">No hay operaciones registradas.</td></tr>
        `;
        return;
    }

    for (const op of lista) {
        const tr = document.createElement("tr");

        const fechaStr = op.fecha || "";

        tr.innerHTML = `
            <td>${op.id}</td>
            <td>${op.tipo}</td>
            <td>${fechaStr}</td>
            <td>
                <span class="badge ${
                    op.estado === "completada"
                        ? "badge-success"
                        : op.estado === "pendiente"
                        ? "badge-warning"
                        : op.estado === "cancelada"
                        ? "badge-danger"
                        : ""
                }">
                    ${op.estado}
                </span>
            </td>
            <td>${op.cliente_id ?? "-"}</td>
            <td>${op.proveedor_id ?? "-"}</td>
            <td>${op.pais_origen_id ?? "-"} / ${op.puerto_origen_id ?? "-"}</td>
            <td>${op.pais_destino_id ?? "-"} / ${op.puerto_destino_id ?? "-"}</td>
            <td>${op.medio_transporte_id ?? "-"}</td>
            <td>${op.costo_total ?? 0}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="eliminarOperacion(${op.id})">
                    Eliminar
                </button>
            </td>
        `;

        operacionesBody.appendChild(tr);
    }
}

// ===============================
// Crear operación
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        tipo: document.getElementById("tipo").value,
        fecha: document.getElementById("fecha").value,
        estado: document.getElementById("estado").value || "pendiente",
        observaciones: document.getElementById("observaciones").value || null,
        cliente_id: document.getElementById("cliente_id").value
            ? Number(document.getElementById("cliente_id").value)
            : null,
        proveedor_id: document.getElementById("proveedor_id").value
            ? Number(document.getElementById("proveedor_id").value)
            : null,
        pais_origen_id: document.getElementById("pais_origen_id").value
            ? Number(document.getElementById("pais_origen_id").value)
            : null,
        pais_destino_id: document.getElementById("pais_destino_id").value
            ? Number(document.getElementById("pais_destino_id").value)
            : null,
        puerto_origen_id: document.getElementById("puerto_origen_id").value
            ? Number(document.getElementById("puerto_origen_id").value)
            : null,
        puerto_destino_id: document.getElementById("puerto_destino_id").value
            ? Number(document.getElementById("puerto_destino_id").value)
            : null,
        medio_transporte_id: document.getElementById("medio_transporte_id").value
            ? Number(document.getElementById("medio_transporte_id").value)
            : null,
    };

    if (!data.tipo || !data.fecha) {
        alerta("Tipo y fecha son obligatorios.");
        return;
    }

    // validaciones simples relacionadas con reglas de negocio
    if (data.tipo === "exportacion" && !data.cliente_id) {
        alerta("Para una exportación debes indicar un cliente.");
        return;
    }

    if (data.tipo === "importacion" && !data.proveedor_id) {
        alerta("Para una importación debes indicar un proveedor.");
        return;
    }

    try {
        const resp = await fetch(`${API_BASE}/operaciones/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => null);
            console.error("Error al crear operación:", errData);
            throw new Error("Error al crear operación");
        }

        form.reset();
        document.getElementById("estado").value = "pendiente";
        await cargarOperaciones();
        alerta("Operación registrada correctamente.");
    } catch (err) {
        console.error(err);
        alerta("No se pudo registrar la operación.");
    }
});

// ===============================
// Eliminar operación
// ===============================
async function eliminarOperacion(id) {
    if (!confirm("¿Seguro que quieres eliminar esta operación?")) return;

    try {
        const resp = await fetch(`${API_BASE}/operaciones/${id}`, {
            method: "DELETE",
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => null);
            console.error("Error al eliminar operación:", errData);
            throw new Error("Error al eliminar operación");
        }

        await cargarOperaciones();
        alerta("Operación eliminada correctamente.");
    } catch (err) {
        console.error(err);
        alerta("No se pudo eliminar la operación.");
    }
}

// ===============================
// Búsqueda
// ===============================
buscarInput.addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase();

    const filtradas = operaciones.filter((op) => {
        const idStr = String(op.id);
        const tipo = op.tipo?.toLowerCase() ?? "";
        const estado = op.estado?.toLowerCase() ?? "";
        return (
            idStr.includes(texto) ||
            tipo.includes(texto) ||
            estado.includes(texto)
        );
    });

    renderOperaciones(filtradas);
});

// ===============================
// Limpiar formulario
// ===============================
limpiarBtn.addEventListener("click", () => {
    form.reset();
    document.getElementById("estado").value = "pendiente";
});

// ===============================
// Iniciar
// ===============================
document.addEventListener("DOMContentLoaded", cargarOperaciones);

// Exponer eliminar en window para usarlo en botones
window.eliminarOperacion = eliminarOperacion;

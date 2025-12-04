// js/detalles.js

const API_BASE = "https://proyecto-importacion-2.onrender.com/paises.html";


const detallesBody = document.getElementById("detallesBody");
const buscarInput = document.getElementById("buscar");
const form = document.getElementById("detalleForm");
const limpiarBtn = document.getElementById("limpiarBtn");

let detalles = [];
let editandoId = null;

function avisar(msg) {
    alert(msg);
}

// ===============================
// Cargar detalles
// ===============================
async function cargarDetalles() {
    try {
        const resp = await fetch(`${API_BASE}/detalles/`);
        if (!resp.ok) throw new Error("Error al cargar detalles");
        detalles = await resp.json();
        renderDetalles(detalles);
    } catch (err) {
        console.error(err);
        avisar("No se pudieron cargar los detalles.");
    }
}

// ===============================
// Render tabla
// ===============================
function renderDetalles(lista) {
    detallesBody.innerHTML = "";

    if (!lista.length) {
        detallesBody.innerHTML = `
            <tr><td colspan="7">No hay detalles registrados.</td></tr>
        `;
        return;
    }

    for (const det of lista) {
        const subtotal = (det.cantidad ?? 0) * (det.precio_unitario ?? 0);

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${det.id}</td>
            <td>${det.operacion_id}</td>
            <td>${det.producto_id}</td>
            <td>${det.cantidad}</td>
            <td>${det.precio_unitario}</td>
            <td>${subtotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editarDetalle(${det.id})">
                    Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarDetalle(${det.id})">
                    Eliminar
                </button>
            </td>
        `;
        detallesBody.appendChild(tr);
    }
}

// ===============================
// Crear / actualizar detalle
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        operacion_id: document.getElementById("operacion_id").value
            ? Number(document.getElementById("operacion_id").value)
            : null,
        producto_id: document.getElementById("producto_id").value
            ? Number(document.getElementById("producto_id").value)
            : null,
        cantidad: document.getElementById("cantidad").value
            ? Number(document.getElementById("cantidad").value)
            : null,
        precio_unitario: document.getElementById("precio_unitario").value
            ? Number(document.getElementById("precio_unitario").value)
            : null,
    };

    if (!data.operacion_id || !data.producto_id || !data.cantidad || !data.precio_unitario) {
        avisar("Todos los campos son obligatorios.");
        return;
    }

    if (data.cantidad <= 0 || data.precio_unitario <= 0) {
        avisar("Cantidad y precio unitario deben ser mayores a 0.");
        return;
    }

    try {
        let resp;
        if (!editandoId) {
            // Crear
            resp = await fetch(`${API_BASE}/detalles/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        } else {
            // Actualizar
            resp = await fetch(`${API_BASE}/detalles/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            editandoId = null;
        }

        if (!resp.ok) {
            const errData = await resp.json().catch(() => null);
            console.error("Error al guardar detalle:", errData);
            // aquí suelen llegar errores de stock insuficiente, etc.
            avisar(
                errData?.detail ||
                    "No se pudo guardar el detalle. Verifica operación, producto y stock."
            );
            return;
        }

        form.reset();
        await cargarDetalles();
        avisar("Detalle guardado correctamente.");
    } catch (err) {
        console.error(err);
        avisar("No se pudo guardar el detalle.");
    }
});

// ===============================
// Editar detalle
// ===============================
async function editarDetalle(id) {
    try {
        const resp = await fetch(`${API_BASE}/detalles/${id}`);
        if (!resp.ok) throw new Error("No se pudo obtener el detalle");

        const det = await resp.json();

        document.getElementById("operacion_id").value = det.operacion_id ?? "";
        document.getElementById("producto_id").value = det.producto_id ?? "";
        document.getElementById("cantidad").value = det.cantidad ?? "";
        document.getElementById("precio_unitario").value = det.precio_unitario ?? "";

        editandoId = det.id;
    } catch (err) {
        console.error(err);
        avisar("No se pudo cargar la información del detalle.");
    }
}

// ===============================
// Eliminar detalle
// ===============================
async function eliminarDetalle(id) {
    if (!confirm("¿Eliminar este detalle? Esto ajustará el costo total de la operación.")) {
        return;
    }

    try {
        const resp = await fetch(`${API_BASE}/detalles/${id}`, {
            method: "DELETE",
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => null);
            console.error("Error al eliminar detalle:", errData);
            throw new Error("Error al eliminar detalle");
        }

        await cargarDetalles();
        avisar("Detalle eliminado correctamente.");
    } catch (err) {
        console.error(err);
        avisar("No se pudo eliminar el detalle.");
    }
}

// ===============================
// Búsqueda dinámica
// ===============================
buscarInput.addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase();

    const filtrados = detalles.filter((d) => {
        const idStr = String(d.id);
        const operacionStr = String(d.operacion_id ?? "");
        const productoStr = String(d.producto_id ?? "");
        return (
            idStr.includes(texto) ||
            operacionStr.includes(texto) ||
            productoStr.includes(texto)
        );
    });

    renderDetalles(filtrados);
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
document.addEventListener("DOMContentLoaded", cargarDetalles);

// Exponer funciones para los botones
window.editarDetalle = editarDetalle;
window.eliminarDetalle = eliminarDetalle;

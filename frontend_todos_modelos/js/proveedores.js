// js/proveedores.js

const API_BASE = "https://proyecto-importacion-2.onrender.com/paises.html";


const proveedoresBody = document.getElementById("proveedoresBody");
const buscarInput = document.getElementById("buscar");
const form = document.getElementById("proveedorForm");
const limpiarBtn = document.getElementById("limpiarBtn");

let proveedores = [];
let editandoId = null;

// ===============================
// Cargar proveedores
// ===============================
async function cargarProveedores() {
    try {
        const resp = await fetch(`${API_BASE}/proveedores/`);
        if (!resp.ok) throw new Error("Error al cargar proveedores");
        proveedores = await resp.json();
        mostrarProveedores(proveedores);
    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los proveedores.");
    }
}

// ===============================
// Mostrar en tabla
// ===============================
function mostrarProveedores(lista) {
    proveedoresBody.innerHTML = "";

    if (!lista.length) {
        proveedoresBody.innerHTML = `
            <tr><td colspan="7">No hay proveedores registrados.</td></tr>
        `;
        return;
    }

    lista.forEach((prov) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${prov.id}</td>
            <td>${prov.nombre}</td>
            <td>${prov.tipo ?? ""}</td>
            <td>${prov.email ?? ""}</td>
            <td>${prov.telefono ?? ""}</td>
            <td>${prov.pais_id ?? "-"}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editarProveedor(${prov.id})">
                    Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarProveedor(${prov.id})">
                    Eliminar
                </button>
            </td>
        `;

        proveedoresBody.appendChild(tr);
    });
}

// ===============================
// Crear / actualizar proveedor
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById("nombre").value.trim(),
        tipo: document.getElementById("tipo").value || null,
        email: document.getElementById("email").value || null,
        telefono: document.getElementById("telefono").value || null,
        pais_id: document.getElementById("pais_id").value
            ? Number(document.getElementById("pais_id").value)
            : null,
    };

    if (!data.nombre) {
        alert("El nombre del proveedor es obligatorio.");
        return;
    }

    try {
        if (!editandoId) {
            // Crear
            const resp = await fetch(`${API_BASE}/proveedores/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!resp.ok) {
                console.error(await resp.json().catch(() => null));
                throw new Error("Error al crear proveedor");
            }
        } else {
            // Actualizar
            const resp = await fetch(`${API_BASE}/proveedores/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!resp.ok) {
                console.error(await resp.json().catch(() => null));
                throw new Error("Error al actualizar proveedor");
            }

            editandoId = null;
        }

        form.reset();
        await cargarProveedores();
        alert("Proveedor guardado correctamente.");
    } catch (err) {
        console.error(err);
        alert("No se pudo guardar el proveedor.");
    }
});

// ===============================
// Editar proveedor
// ===============================
async function editarProveedor(id) {
    try {
        const resp = await fetch(`${API_BASE}/proveedores/${id}`);
        if (!resp.ok) throw new Error("No se pudo obtener el proveedor.");
        const prov = await resp.json();

        document.getElementById("nombre").value = prov.nombre ?? "";
        document.getElementById("tipo").value = prov.tipo ?? "";
        document.getElementById("email").value = prov.email ?? "";
        document.getElementById("telefono").value = prov.telefono ?? "";
        document.getElementById("pais_id").value = prov.pais_id ?? "";

        editandoId = prov.id;
    } catch (err) {
        console.error(err);
        alert("No se pudo cargar la información del proveedor.");
    }
}

// ===============================
// Eliminar proveedor
// ===============================
async function eliminarProveedor(id) {
    if (!confirm("¿Seguro que deseas eliminar este proveedor?")) return;

    try {
        const resp = await fetch(`${API_BASE}/proveedores/${id}`, {
            method: "DELETE",
        });

        if (!resp.ok) throw new Error("Error al eliminar proveedor.");

        await cargarProveedores();
        alert("Proveedor eliminado.");
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar el proveedor.");
    }
}

// ===============================
// Búsqueda en vivo
// ===============================
buscarInput.addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase();
    const filtrados = proveedores.filter((p) => {
        const nombre = p.nombre?.toLowerCase() ?? "";
        const email = p.email?.toLowerCase() ?? "";
        return nombre.includes(texto) || email.includes(texto);
    });
    mostrarProveedores(filtrados);
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
document.addEventListener("DOMContentLoaded", cargarProveedores);

// Exponer funciones al ámbito global para usarlas en el HTML
window.editarProveedor = editarProveedor;
window.eliminarProveedor = eliminarProveedor;

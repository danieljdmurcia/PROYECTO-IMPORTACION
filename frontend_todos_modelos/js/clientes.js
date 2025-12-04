// js/clientes.js

const API_BASE = "https://proyecto-importacion.onrender.com";


const clientesBody = document.getElementById("clientesBody");
const buscarInput = document.getElementById("buscar");
const form = document.getElementById("clienteForm");
const limpiarBtn = document.getElementById("limpiarBtn");

let clientes = [];
let editandoId = null;

// ===============================
// Cargar clientes
// ===============================
async function cargarClientes() {
    try {
        const resp = await fetch(`${API_BASE}/clientes/`);
        if (!resp.ok) throw new Error("Error al cargar clientes");
        clientes = await resp.json();
        mostrarClientes(clientes);
    } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los clientes.");
    }
}

// ===============================
// Mostrar en tabla
// ===============================
function mostrarClientes(lista) {
    clientesBody.innerHTML = "";

    if (!lista.length) {
        clientesBody.innerHTML = `
            <tr><td colspan="7">No hay clientes registrados.</td></tr>
        `;
        return;
    }

    lista.forEach((cli) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${cli.id}</td>
            <td>${cli.nombre}</td>
            <td>${cli.tipo ?? ""}</td>
            <td>${cli.email ?? ""}</td>
            <td>${cli.telefono ?? ""}</td>
            <td>${cli.pais_id ?? "-"}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editarCliente(${cli.id})">
                    Editar
                </button>
                <button class="btn btn-danger btn-sm" onclick="eliminarCliente(${cli.id})">
                    Eliminar
                </button>
            </td>
        `;

        clientesBody.appendChild(tr);
    });
}

// ===============================
// Crear / actualizar cliente
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
        alert("El nombre del cliente es obligatorio.");
        return;
    }

    try {
        if (!editandoId) {
            // Crear
            const resp = await fetch(`${API_BASE}/clientes/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!resp.ok) {
                console.error(await resp.json().catch(() => null));
                throw new Error("Error al crear cliente");
            }
        } else {
            // Actualizar
            const resp = await fetch(`${API_BASE}/clientes/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!resp.ok) {
                console.error(await resp.json().catch(() => null));
                throw new Error("Error al actualizar cliente");
            }

            editandoId = null;
        }

        form.reset();
        await cargarClientes();
        alert("Cliente guardado correctamente.");
    } catch (err) {
        console.error(err);
        alert("No se pudo guardar el cliente.");
    }
});

// ===============================
// Editar cliente (llenar formulario)
// ===============================
async function editarCliente(id) {
    try {
        const resp = await fetch(`${API_BASE}/clientes/${id}`);
        if (!resp.ok) throw new Error("No se pudo obtener el cliente.");
        const cli = await resp.json();

        document.getElementById("nombre").value = cli.nombre ?? "";
        document.getElementById("tipo").value = cli.tipo ?? "";
        document.getElementById("email").value = cli.email ?? "";
        document.getElementById("telefono").value = cli.telefono ?? "";
        document.getElementById("pais_id").value = cli.pais_id ?? "";

        editandoId = cli.id;
    } catch (err) {
        console.error(err);
        alert("No se pudo cargar la información del cliente.");
    }
}

// ===============================
// Eliminar cliente
// ===============================
async function eliminarCliente(id) {
    if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;

    try {
        const resp = await fetch(`${API_BASE}/clientes/${id}`, {
            method: "DELETE",
        });

        if (!resp.ok) throw new Error("Error al eliminar cliente.");

        await cargarClientes();
        alert("Cliente eliminado.");
    } catch (err) {
        console.error(err);
        alert("No se pudo eliminar el cliente.");
    }
}

// ===============================
// Búsqueda en vivo
// ===============================
buscarInput.addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase();
    const filtrados = clientes.filter((c) => {
        const nombre = c.nombre?.toLowerCase() ?? "";
        const email = c.email?.toLowerCase() ?? "";
        return nombre.includes(texto) || email.includes(texto);
    });
    mostrarClientes(filtrados);
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
document.addEventListener("DOMContentLoaded", cargarClientes);

// Para que las funciones editar/eliminar sean visibles desde el HTML
window.editarCliente = editarCliente;
window.eliminarCliente = eliminarCliente;

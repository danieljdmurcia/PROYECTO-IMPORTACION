// js/productos.js
const API_BASE = "https://proyecto-importacion.onrender.com";


const tbody = document.getElementById("productosTableBody");
const form = document.getElementById("productoForm");
const searchInput = document.getElementById("searchInput");

let productos = [];

// -------------------- UTILIDADES --------------------
function mostrarAlerta(mensaje) {
    alert(mensaje);
}

// -------------------- CARGAR PRODUCTOS --------------------
async function cargarProductos() {
    try {
        const resp = await fetch(`${API_BASE}/productos/`);
        if (!resp.ok) throw new Error("Error al cargar productos");
        productos = await resp.json();
        renderTabla(productos);
    } catch (err) {
        console.error(err);
        mostrarAlerta("No se pudieron cargar los productos.");
    }
}

function renderTabla(lista) {
    tbody.innerHTML = "";

    if (!lista.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">No hay productos registrados.</td>
            </tr>
        `;
        return;
    }

    for (const p of lista) {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.nombre}</td>
            <td>${p.tipo}</td>
            <td>${p.unidad_medida}</td>
            <td>${p.precio_referencia}</td>
            <td>${p.stock_disponible}</td>
            <td>${p.categoria_id ?? "-"}</td>
            <td>
                <button class="btn btn-danger btn-sm" data-id="${p.id}">
                    Eliminar
                </button>
            </td>
        `;

        const btnEliminar = tr.querySelector("button");
        btnEliminar.addEventListener("click", () => eliminarProducto(p.id));

        tbody.appendChild(tr);
    }
}

// -------------------- CREAR PRODUCTO --------------------
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
        nombre: form.nombre.value.trim(),
        tipo: form.tipo.value,
        unidad_medida: form.unidad_medida.value || "kg",
        precio_referencia: Number(form.precio_referencia.value),
        stock_disponible: Number(form.stock_disponible.value || 0),
        categoria_id: form.categoria_id.value ? Number(form.categoria_id.value) : null
    };

    if (!datos.nombre || !datos.tipo || isNaN(datos.precio_referencia)) {
        mostrarAlerta("Por favor completa los campos obligatorios.");
        return;
    }

    if (datos.precio_referencia < 0) {
        mostrarAlerta("El precio de referencia no puede ser negativo.");
        return;
    }

    try {
        const resp = await fetch(`${API_BASE}/productos/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => null);
            console.error(errData);
            throw new Error("Error al crear producto");
        }

        form.reset();
        form.unidad_medida.value = "kg";
        form.stock_disponible.value = "0";

        await cargarProductos();
        mostrarAlerta("Producto creado correctamente.");
    } catch (err) {
        console.error(err);
        mostrarAlerta("No se pudo crear el producto.");
    }
});

// -------------------- ELIMINAR PRODUCTO --------------------
async function eliminarProducto(id) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    try {
        const resp = await fetch(`${API_BASE}/productos/${id}`, {
            method: "DELETE"
        });

        if (!resp.ok) throw new Error("Error al eliminar producto");

        await cargarProductos();
        mostrarAlerta("Producto eliminado correctamente.");
    } catch (err) {
        console.error(err);
        mostrarAlerta("No se pudo eliminar el producto.");
    }
}

// -------------------- BUSCADOR --------------------
searchInput.addEventListener("input", () => {
    const texto = searchInput.value.toLowerCase();
    const filtrados = productos.filter((p) =>
        p.nombre.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

// -------------------- INICIO --------------------
cargarProductos();

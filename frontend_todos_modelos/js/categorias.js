const API_BASE = "https://proyecto-importacion.onrender.co";


const categoriasBody = document.getElementById("categoriasBody");
const buscarInput = document.getElementById("buscar");
const form = document.getElementById("categoriaForm");

let categorias = [];
let editandoId = null;

// ===============================
// Cargar categorías
// ===============================
async function cargarCategorias() {
    const resp = await fetch(`${API_BASE}/categorias/`);
    categorias = await resp.json();
    mostrarCategorias(categorias);
}

// ===============================
// Mostrar categorías en tabla
// ===============================
function mostrarCategorias(lista) {
    categoriasBody.innerHTML = "";

    if (lista.length === 0) {
        categoriasBody.innerHTML = `
            <tr><td colspan="4">No hay categorías registradas.</td></tr>
        `;
        return;
    }

    lista.forEach(cat => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${cat.id}</td>
            <td>${cat.nombre}</td>
            <td>${cat.descripcion ?? ""}</td>
            <td>
                <button class="btn-secondary btn-sm" onclick="editarCategoria(${cat.id})">Editar</button>
                <button class="btn-danger btn-sm" onclick="eliminarCategoria(${cat.id})">Eliminar</button>
            </td>
        `;

        categoriasBody.appendChild(tr);
    });
}

// ===============================
// Crear o actualizar categoría
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value
    };

    if (!editandoId) {
        // Crear categoría
        await fetch(`${API_BASE}/categorias/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    } else {
        // Editar categoría
        await fetch(`${API_BASE}/categorias/${editandoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        editandoId = null;
    }

    form.reset();
    cargarCategorias();
});

// ===============================
// Llenar formulario al editar
// ===============================
async function editarCategoria(id) {
    const resp = await fetch(`${API_BASE}/categorias/${id}`);
    const cat = await resp.json();

    document.getElementById("nombre").value = cat.nombre;
    document.getElementById("descripcion").value = cat.descripcion ?? "";

    editandoId = id;
}

// ===============================
// Eliminar categoría
// ===============================
async function eliminarCategoria(id) {
    if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;

    await fetch(`${API_BASE}/categorias/${id}`, {
        method: "DELETE"
    });

    cargarCategorias();
}

// ===============================
// Búsqueda dinámica
// ===============================
buscarInput.addEventListener("input", () => {
    const texto = buscarInput.value.toLowerCase();
    const filtradas = categorias.filter(c =>
        c.nombre.toLowerCase().includes(texto)
    );
    mostrarCategorias(filtradas);
});

// ===============================
// Limpiar formulario
// ===============================
document.getElementById("limpiarBtn").addEventListener("click", () => {
    editandoId = null;
    form.reset();
});

// ===============================
// Iniciar
// ===============================
document.addEventListener("DOMContentLoaded", cargarCategorias);

// js/reportes.js

const API_BASE = "https://proyecto-importacion-2.onrender.com/paises.html";

// IMPORTANTE:
// Ajusta los paths si en tu router usaste otros nombres.
// Aquí supongo endpoints tipo:
//   GET /reportes/top-productos
//   GET /reportes/operaciones-por-pais
//   GET /reportes/operaciones-por-mes

const topProductosBody = document.getElementById("topProductosBody");
const operacionesPaisBody = document.getElementById("operacionesPaisBody");
const operacionesMesBody = document.getElementById("operacionesMesBody");

let chartTopProductos = null;
let chartOperacionesPais = null;
let chartOperacionesMes = null;

function mostrarError(mensaje) {
    console.error(mensaje);
    alert(mensaje);
}

// ---------------- TOP PRODUCTOS ----------------
async function cargarTopProductos() {
    try {
        const resp = await fetch(`${API_BASE}/reportes/top-productos`);
        if (!resp.ok) throw new Error("Error al cargar top de productos");
        const data = await resp.json();

        renderTopProductosTabla(data);
        renderTopProductosChart(data);
    } catch (err) {
        mostrarError("No se pudieron cargar los reportes de productos.");
    }
}

function renderTopProductosTabla(lista) {
    topProductosBody.innerHTML = "";

    if (!lista.length) {
        topProductosBody.innerHTML = `
            <tr>
                <td colspan="3">No hay información disponible.</td>
            </tr>
        `;
        return;
    }

    for (const item of lista) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.producto || item.nombre_producto || "N/D"}</td>
            <td>${item.total_cantidad ?? "-"}</td>
            <td>${item.total_valor ?? "-"}</td>
        `;
        topProductosBody.appendChild(tr);
    }
}

function renderTopProductosChart(lista) {
    const ctx = document.getElementById("topProductosChart");

    if (chartTopProductos) chartTopProductos.destroy();

    const labels = lista.map(
        (i) => i.producto || i.nombre_producto || "N/D"
    );
    const cantidades = lista.map((i) => i.total_cantidad ?? 0);

    chartTopProductos = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Cantidad exportada",
                    data: cantidades,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

// ---------------- OPERACIONES POR PAÍS ----------------
async function cargarOperacionesPorPais() {
    try {
        const resp = await fetch(`${API_BASE}/reportes/operaciones-por-pais`);
        if (!resp.ok) throw new Error("Error al cargar operaciones por país");
        const data = await resp.json();

        renderOperacionesPaisTabla(data);
        renderOperacionesPaisChart(data);
    } catch (err) {
        mostrarError("No se pudieron cargar los reportes por país.");
    }
}

function renderOperacionesPaisTabla(lista) {
    operacionesPaisBody.innerHTML = "";

    if (!lista.length) {
        operacionesPaisBody.innerHTML = `
            <tr>
                <td colspan="3">No hay información disponible.</td>
            </tr>
        `;
        return;
    }

    for (const item of lista) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.pais || item.pais_destino || "N/D"}</td>
            <td>${item.total_operaciones ?? "-"}</td>
            <td>${item.total_valor ?? "-"}</td>
        `;
        operacionesPaisBody.appendChild(tr);
    }
}

function renderOperacionesPaisChart(lista) {
    const ctx = document.getElementById("operacionesPaisChart");

    if (chartOperacionesPais) chartOperacionesPais.destroy();

    const labels = lista.map((i) => i.pais || i.pais_destino || "N/D");
    const valores = lista.map((i) => i.total_operaciones ?? 0);

    chartOperacionesPais = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [
                {
                    label: "Operaciones",
                    data: valores,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" },
            },
        },
    });
}

// ---------------- OPERACIONES POR MES ----------------
async function cargarOperacionesPorMes() {
    try {
        const resp = await fetch(`${API_BASE}/reportes/operaciones-por-mes`);
        if (!resp.ok) throw new Error("Error al cargar operaciones por mes");
        const data = await resp.json();

        renderOperacionesMesTabla(data);
        renderOperacionesMesChart(data);
    } catch (err) {
        mostrarError("No se pudieron cargar los reportes por mes.");
    }
}

function renderOperacionesMesTabla(lista) {
    operacionesMesBody.innerHTML = "";

    if (!lista.length) {
        operacionesMesBody.innerHTML = `
            <tr>
                <td colspan="3">No hay información disponible.</td>
            </tr>
        `;
        return;
    }

    for (const item of lista) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.mes || item.periodo || "N/D"}</td>
            <td>${item.total_operaciones ?? "-"}</td>
            <td>${item.total_valor ?? "-"}</td>
        `;
        operacionesMesBody.appendChild(tr);
    }
}

function renderOperacionesMesChart(lista) {
    const ctx = document.getElementById("operacionesMesChart");

    if (chartOperacionesMes) chartOperacionesMes.destroy();

    const labels = lista.map((i) => i.mes || i.periodo || "N/D");
    const valores = lista.map((i) => i.total_operaciones ?? 0);

    chartOperacionesMes = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Operaciones",
                    data: valores,
                    tension: 0.25,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

// ---------------- INICIO ----------------
function initReportes() {
    cargarTopProductos();
    cargarOperacionesPorPais();
    cargarOperacionesPorMes();
}

document.addEventListener("DOMContentLoaded", initReportes);

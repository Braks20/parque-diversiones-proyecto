
const URL_BASE = "http://localhost:3002/atracciones";

// --- [READ]
async function getAtracciones() {
    try {
        const respuesta = await fetch(URL_BASE);
        if (!respuesta.ok) throw new Error("Error al leer la base de datos");
        return await respuesta.json(); // Retorna los datos para que home.js los use
    } catch (error) {
        console.error("Error CRUD (Read):", error);
    }
}

// --- [CREATE]
async function postAtraccion(nuevaAtraccion) {
    try {
        const respuesta = await fetch(URL_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaAtraccion)
        });
        return await respuesta.json(); // Retorna la respuesta para confirmar en home.js
    } catch (error) {
        console.error("Error CRUD (Create):", error);
    }
}

// --- [DELETE]
async function deleteAtraccion(id) {
    try {
        const respuesta = await fetch(`${URL_BASE}/${id}`, {
            method: 'DELETE'
        });
        return respuesta.ok;
    } catch (error) {
        console.error("Error CRUD (Delete):", error);
    }
}

// --- [UPDATE - PUT]
async function putAtraccion(id, datosActualizados) {
    try {
        const respuesta = await fetch(`${URL_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        return respuesta.ok;
    } catch (error) {
        console.error("Error CRUD (Update PUT):", error);
    }
}

// --- [UPDATE - PATCH]
async function patchAtraccion(id, datosActualizados) {
    try {
        const respuesta = await fetch(`${URL_BASE}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        return respuesta.ok;
    } catch (error) {
        console.error("Error CRUD (Update PATCH):", error);
    }
}

export { getAtracciones, postAtraccion, deleteAtraccion, putAtraccion, patchAtraccion };
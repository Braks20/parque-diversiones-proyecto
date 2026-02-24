import { getAtracciones, postAtraccion, deleteAtraccion, putAtraccion } from "../services/atraccionesServices.js";

// --- Referencias al DOM ---
const btnAgregar = document.getElementById('btnAgregarAtraccion');
const capaModal = document.getElementById('capaModal');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const formularioAtraccion = document.getElementById('formularioAtraccion');
const rejillaDinamica = document.getElementById('rejillaDinamica');
const plantillaTarjeta = document.getElementById('plantillaTarjeta');
const contadorElementos = document.getElementById('contadorElementos');
const contenedorFormulario = document.getElementById('contenedorFormulario');
const cabeceraModal = document.getElementById('cabeceraModal');
const tituloModal = document.getElementById('tituloModal');

// Campos del formulario
const inputImagen = document.getElementById('urlImagen');
const inputNombre = document.getElementById('nombreAtraccion');
const inputDescripcion = document.getElementById('descripcionAtraccion');
const inputPrecio = document.getElementById('precioAtraccion');
const selectCategoria = document.getElementById('categoriaAtraccion');
const selectEstado = document.getElementById('estadoAtraccion');

// Búsqueda y Filtros
const inputBusqueda = document.getElementById('busquedaAtraccion');
const selectFiltroEstado = document.getElementById('filtroEstado');

// --- Estado de la Aplicación ---
let idEnEdicion = null;
let cargando = false;

// --- Funciones del Modal ---
const abrirModal = (datos = null) => {
    limpiarFormulario();
    // Reiniciar posición manual por si fue arrastrado
    contenedorFormulario.style.top = '';
    contenedorFormulario.style.left = '';
    contenedorFormulario.style.transform = '';

    if (datos) {
        idEnEdicion = datos.id;
        tituloModal.textContent = "Editar Atracción";
        cargarDatosFormulario(datos);
    } else {
        idEnEdicion = null;
        tituloModal.textContent = "Nueva Atracción";
    }

    capaModal.classList.remove('oculta');
};

const cerrarModal = () => {
    capaModal.classList.add('oculta');
    limpiarFormulario();
};

const limpiarFormulario = () => {
    formularioAtraccion.reset();
    idEnEdicion = null;
};

const cargarDatosFormulario = (datos) => {
    inputImagen.value = datos.imagen || '';
    inputNombre.value = datos.nombre || '';
    inputDescripcion.value = datos.descripcion || '';
    inputPrecio.value = datos.precio || '';
    selectCategoria.value = datos.categoria || '';
    selectEstado.value = datos.estado || '';
};

// --- Lógica de Arrastrar (Draggable) ---
let arrastrando = false;
let desplX, desplY;

cabeceraModal.addEventListener('mousedown', (e) => {
    arrastrando = true;
    const rect = contenedorFormulario.getBoundingClientRect();
    desplX = e.clientX - rect.left;
    desplY = e.clientY - rect.top;

    contenedorFormulario.style.margin = '0';
    contenedorFormulario.style.transform = 'none';
    contenedorFormulario.style.top = rect.top + 'px';
    contenedorFormulario.style.left = rect.left + 'px';
});

document.addEventListener('mousemove', (e) => {
    if (!arrastrando) return;
    contenedorFormulario.style.left = (e.clientX - desplX) + 'px';
    contenedorFormulario.style.top = (e.clientY - desplY) + 'px';
});

document.addEventListener('mouseup', () => {
    arrastrando = false;
});

// --- Renderizado y Crud ---
async function obtenerYRenderizarAtracciones() {
    if (cargando) return;
    cargando = true;

    try {
        const atracciones = await getAtracciones();
        if (!atracciones) return;

        filtrarYRenderizar(atracciones);
    } catch (error) {
        console.error("Error al obtener atracciones:", error);
    } finally {
        cargando = false;
    }
}

function filtrarYRenderizar(todas) {
    const textoBusqueda = inputBusqueda.value.toLowerCase();
    const estadoFiltro = selectFiltroEstado.value;

    const filtradas = todas.filter(atraccion => {
        const coincideNombre = atraccion.nombre.toLowerCase().includes(textoBusqueda);
        const coincideEstado = estadoFiltro === 'todos' || atraccion.estado === estadoFiltro;
        return coincideNombre && coincideEstado;
    });

    renderizarTarjetas(filtradas);
}

function renderizarTarjetas(lista) {
    rejillaDinamica.innerHTML = "";

    lista.forEach(atraccion => {
        const clon = plantillaTarjeta.content.cloneNode(true);

        // Imagen y Estado
        const img = clon.querySelector('.imagenAtraccion');
        img.src = atraccion.imagen || '../img/placeholder.jpg';
        img.alt = atraccion.nombre;

        const badgeEstado = clon.querySelector('.etiquetaEstado');
        badgeEstado.textContent = atraccion.estado;
        badgeEstado.className = `etiquetaEstado estado-${atraccion.estado.toLowerCase().replace(/ /g, '-')}`;

        // Contenido
        clon.querySelector('.nombreTexto').textContent = atraccion.nombre;
        clon.querySelector('.descripcionTexto').textContent = atraccion.descripcion;
        clon.querySelector('.etiquetaCategoria').textContent = atraccion.categoria;
        clon.querySelector('.precioTexto').textContent = `$${atraccion.precio}`;

        // Acciones
        clon.querySelector('.btnEliminar').addEventListener('click', async () => {
            const resultado = await Swal.fire({
                title: '¿Estás seguro?',
                text: `Vas a eliminar la atracción "${atraccion.nombre}"`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#6c5ce7',
                cancelButtonColor: '#ff7675',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (resultado.isConfirmed) {
                await deleteAtraccion(atraccion.id);
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'La atracción ha sido borrada.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                obtenerYRenderizarAtracciones();
            }
        });

        clon.querySelector('.btnEditar').addEventListener('click', () => {
            abrirModal(atraccion);
        });

        rejillaDinamica.appendChild(clon);
    });

    contadorElementos.textContent = lista.length;
}

// --- Eventos ---
btnAgregar.addEventListener('click', () => abrirModal());
btnCerrarModal.addEventListener('click', cerrarModal);
capaModal.addEventListener('click', (e) => {
    if (e.target === capaModal) cerrarModal();
});

formularioAtraccion.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datosAtraccion = {
        nombre: inputNombre.value,
        descripcion: inputDescripcion.value,
        imagen: inputImagen.value,
        precio: parseFloat(inputPrecio.value),
        estado: selectEstado.value,
        categoria: selectCategoria.value
    };

    try {
        if (idEnEdicion) {
            await putAtraccion(idEnEdicion, datosAtraccion);
            Swal.fire({
                title: '¡Actualizado!',
                text: 'La atracción se modificó correctamente.',
                icon: 'success',
                confirmButtonColor: '#6c5ce7'
            });
        } else {
            await postAtraccion(datosAtraccion);
            Swal.fire({
                title: '¡Guardado!',
                text: 'Nueva atracción añadida al parque.',
                icon: 'success',
                confirmButtonColor: '#6c5ce7'
            });
        }
        cerrarModal();
        obtenerYRenderizarAtracciones();
    } catch (error) {
        console.error("Error al guardar:", error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al procesar la solicitud.',
            icon: 'error',
            confirmButtonColor: '#6c5ce7'
        });
    }
});

inputBusqueda.addEventListener('input', obtenerYRenderizarAtracciones);
selectFiltroEstado.addEventListener('change', obtenerYRenderizarAtracciones);

// --- Inicialización ---
obtenerYRenderizarAtracciones();

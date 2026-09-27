const API_URL = 'http://localhost:3000/tickets';

let tickets = [];

let ticketEnEdicionId = null;

const ESTADOS = {
  abierto: { 
    etiqueta: 'Abierto', 
    clases: 'bg-sky-100 text-sky-800',
    siguiente: 'en_progreso',
    textoBoton: 'Empezar'
  },
  en_progreso: { 
    etiqueta: 'En progreso', 
    clases: 'bg-amber-100 text-amber-800',
    siguiente: 'resuelto',
    textoBoton: 'Marcar resuelto'
  },
  resuelto: { 
    etiqueta: 'Resuelto', 
    clases: 'bg-emerald-100 text-emerald-800',
    siguiente: null,
    textoBoton: null
  },
};

const PRIORIDADES = {
  baja: { etiqueta: 'Prioridad Baja', clases: 'bg-green-100 text-gray-700' },
  media: { etiqueta: 'Prioridad Media', clases: 'bg-orange-100 text-orange-800' },
  alta: { etiqueta: 'Prioridad Alta', clases: 'bg-rose-100 text-rose-800' },
};

const CATEGORIAS = {
  hardware: 'Hardware',
  software: 'Software',
  red: 'Red',
  accesos: 'Accesos'
};

const listaTickets = document.querySelector("#lista-tickets");
const mensajeLista = document.querySelector("#mensaje");
const contenedorResumen = document.querySelector("#resumen");

const filtroEstado = document.querySelector("#filtro-estado");
const campoBusqueda = document.querySelector("#busqueda");

const formularioTickets = document.querySelector("#form-ticket");
const tituloFormulario = document.querySelector("#titulo-formulario");
const tituloTicket = document.querySelector("#titulo");
const descripcionTicket = document.querySelector("#descripcion");
const solicitanteTicket = document.querySelector("#solicitante");
const categoriaTicket = document.querySelector("#categoria");
const prioridadTicket = document.querySelector("#prioridad");

const errorTitulo = document.querySelector("#error-titulo");
const errorSolicitante = document.querySelector("#error-solicitante");

const botonCreaTicket = document.querySelector("#btn-guardar");
const botonCancelarTicket = document.querySelector("#btn-cancelar");

function activarModoEdicion(ticket) {
  ticketEnEdicionId = ticket.id;

  tituloTicket.value = ticket.titulo;
  descripcionTicket.value = ticket.descripcion || '';
  solicitanteTicket.value = ticket.solicitante;
  categoriaTicket.value = ticket.categoria;
  prioridadTicket.value = ticket.prioridad;

  tituloFormulario.textContent = `Editar ticket #${ticket.id}`;
  botonCreaTicket.textContent = "Guardar cambios";
  botonCancelarTicket.hidden = false;

  errorTitulo.textContent = "";
  errorSolicitante.textContent = "";
}

function cancelarEdicion() {
  ticketEnEdicionId = null;

  formularioTickets.reset();

  tituloFormulario.textContent = "Nuevo ticket";
  botonCreaTicket.textContent = "Crear ticket";
  botonCancelarTicket.hidden = true;

  errorTitulo.textContent = "";
  errorSolicitante.textContent = "";
}

function actualizarResumen() {
  if (!contenedorResumen) return;

  const conteo = tickets.reduce((acc, ticket) => {
    // Contar por estado
    if (acc[ticket.estado] !== undefined) {
      acc[ticket.estado]++;
    }

    // Contar prioridad alta sin resolver (abierto o en_progreso)
    if (ticket.prioridad === 'alta' && ticket.estado !== 'resuelto') {
      acc.altaSinResolver++;
    }

    return acc;
  }, { abierto: 0, en_progreso: 0, resuelto: 0, altaSinResolver: 0 });

  contenedorResumen.innerHTML = `
    <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div class="bg-sky-50 border border-sky-100 p-3 rounded-lg text-center">
        <span class="block text-xs font-semibold text-sky-600 uppercase">Abiertos</span>
        <span class="text-xl font-bold text-sky-900">${conteo.abierto}</span>
      </div>
      <div class="bg-amber-50 border border-amber-100 p-3 rounded-lg text-center">
        <span class="block text-xs font-semibold text-amber-600 uppercase">En progreso</span>
        <span class="text-xl font-bold text-amber-900">${conteo.en_progreso}</span>
      </div>
      <div class="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-center">
        <span class="block text-xs font-semibold text-emerald-600 uppercase">Resueltos</span>
        <span class="text-xl font-bold text-emerald-900">${conteo.resuelto}</span>
      </div>
      <div class="bg-rose-50 border border-rose-100 p-3 rounded-lg text-center">
        <span class="block text-xs font-semibold text-rose-600 uppercase">Alta sin resolver</span>
        <span class="text-xl font-bold text-rose-900">${conteo.altaSinResolver}</span>
      </div>
    </div>
  `;
}

function obtenerTicketsFiltrados() {
  const valorEstado = filtroEstado ? filtroEstado.value : 'todos';
  const textoBusqueda = campoBusqueda ? campoBusqueda.value.trim().toLowerCase() : '';

  return tickets.filter(ticket => {
    const coincideEstado = valorEstado === 'todos' || ticket.estado === valorEstado;
    const coincideBusqueda = ticket.titulo.toLowerCase().includes(textoBusqueda);
    return coincideEstado && coincideBusqueda;
  });
}

function renderizarTicket(ticket) {
  const infoEstado = ESTADOS[ticket.estado] || { etiqueta: ticket.estado, clases: 'bg-gray-100 text-gray-800' };
  const infoPrioridad = PRIORIDADES[ticket.prioridad] || { etiqueta: ticket.prioridad, clases: 'bg-gray-100 text-gray-800' };
  const textoCategoria = CATEGORIAS[ticket.categoria] || ticket.categoria;

  const tarjeta = document.createElement('div');
  
  const esResuelto = ticket.estado === 'resuelto';
  const clasesEstadoFondo = esResuelto ? 'bg-gray-50 opacity-60 border-gray-300' : 'bg-white border-gray-200';
  tarjeta.className = `${clasesEstadoFondo} border rounded-xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all`;

  const tituloHtml = document.createElement('h3');
  tituloHtml.className = 'text-base font-bold text-gray-900 mb-1 line-clamp-2';
  tituloHtml.textContent = ticket.titulo;

  const descHtml = document.createElement('p');
  descHtml.className = 'text-sm text-gray-600 mb-4 line-clamp-3';
  if (ticket.descripcion) {
    descHtml.textContent = ticket.descripcion;
  } else {
    descHtml.innerHTML = '<em class="text-gray-400">Sin descripción</em>';
  }

  const solicitanteHtml = document.createElement('strong');
  solicitanteHtml.className = 'text-black font-medium';
  solicitanteHtml.textContent = ticket.solicitante;

  tarjeta.innerHTML = `
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-bold text-gray-400">#${ticket.id}</span>
        <div class="flex items-center gap-2">
          <button type="button" class="btn-editar text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer">Editar</button>
          <button type="button" class="btn-eliminar text-xs font-semibold text-red-400 hover:text-red-600 transition-colors cursor-pointer">Eliminar</button>
          <span class="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-sm">${textoCategoria}</span>
        </div>
      </div>
      <div class="contenedor-titulo"></div>
      <div class="contenedor-desc"></div>
    </div>
    <div class="flex items-center justify-between">
      <span class="text-xs text-gray-500">Solicita: <span class="contenedor-solicitante"></span></span>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 mt-3">
      <div class="flex gap-2">
        <span class="text-xs font-medium px-2 py-1 rounded-xl ${infoPrioridad.clases}">${infoPrioridad.etiqueta}</span>
        <span class="text-xs font-medium px-2 py-1 rounded-xl ${infoEstado.clases}">${infoEstado.etiqueta}</span>
      </div>
      <div class="contenedor-boton"></div>
    </div>
  `;

  tarjeta.querySelector('.contenedor-titulo').replaceWith(tituloHtml);
  tarjeta.querySelector('.contenedor-desc').replaceWith(descHtml);
  tarjeta.querySelector('.contenedor-solicitante').replaceWith(solicitanteHtml);

  tarjeta.querySelector('.btn-editar').addEventListener('click', () => activarModoEdicion(ticket));

  tarjeta.querySelector('.btn-eliminar').addEventListener('click', () => eliminarTicket(ticket.id));

  if (infoEstado.siguiente) {
    const btnAvance = document.createElement('button');
    btnAvance.type = 'button';
    btnAvance.className = 'text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer';
    btnAvance.textContent = infoEstado.textoBoton;

    btnAvance.addEventListener('click', () => {
      cambiarEstadoTicket(ticket.id, infoEstado.siguiente);
    });

    tarjeta.querySelector('.contenedor-boton').appendChild(btnAvance);
  }

  listaTickets.appendChild(tarjeta);
}

function renderizarListaTickets() {
  listaTickets.innerHTML = "";
  
  actualizarResumen();

  const ticketsVisibles = obtenerTicketsFiltrados();

  if (ticketsVisibles.length === 0) {
    mensajeLista.textContent = tickets.length === 0 
      ? "No hay tickets pendientes" 
      : "No se encontraron tickets con los filtros aplicados";
    mensajeLista.className = "text-center py-8 text-gray-500 font-medium block";
    return;
  }

  mensajeLista.textContent = "";
  mensajeLista.className = "hidden";
  listaTickets.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

  ticketsVisibles.forEach(ticket => renderizarTicket(ticket));
}

async function cargarTickets() {
  try {
    mensajeLista.textContent = "Cargando lista de tickets, por favor espera...";
    mensajeLista.className = "text-center py-8 text-gray-500 font-medium block";
    listaTickets.innerHTML = "";

    const respuestaApi = await fetch(API_URL);

    if (!respuestaApi.ok) {
      throw new Error(`Error en el servidor: Código ${respuestaApi.status}`);
    }

    tickets = await respuestaApi.json();
    renderizarListaTickets();

  } catch (error) {
    console.error(error);
    mensajeLista.innerHTML = `
      <div class="text-center p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
        <p class="font-bold text-base mb-1">No pudimos conectar con la base de datos</p>
        <p class="text-sm text-red-600 mb-3">Detalle: ${error.message}</p>
      </div>
    `;
    mensajeLista.className = 'block';
  }
}

async function guardarTicket(event) {
  event.preventDefault();

  errorTitulo.textContent = "";
  errorSolicitante.textContent = "";

  const titulo = tituloTicket.value.trim();
  const solicitante = solicitanteTicket.value.trim();

  let hayErrores = false;

  if (titulo.length < 5) {
    errorTitulo.textContent = "El título debe tener al menos 5 caracteres";
    hayErrores = true;
  }

  if (solicitante === "") {
    errorSolicitante.textContent = "El solicitante es obligatorio";
    hayErrores = true;
  }

  if (hayErrores) return;

  const ticketExistente = tickets.find(t => t.id === ticketEnEdicionId);
  const estadoActual = ticketExistente ? ticketExistente.estado : "abierto";

  const datosTicket = {
    titulo: titulo,
    solicitante: solicitante,
    descripcion: descripcionTicket.value.trim(),
    categoria: categoriaTicket.value,
    prioridad: prioridadTicket.value,
    estado: estadoActual
  };

  try {
    const esEdicion = ticketEnEdicionId !== null;
    const urlPeticion = esEdicion ? `${API_URL}/${ticketEnEdicionId}` : API_URL;
    const metodoHTTP = esEdicion ? "PUT" : "POST";

    const respuesta = await fetch(urlPeticion, {
      method: metodoHTTP,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosTicket)
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const ticketServidor = await respuesta.json();

    if (esEdicion) {
      const indice = tickets.findIndex(t => t.id === ticketServidor.id);
      if (indice !== -1) tickets[indice] = ticketServidor;
    } else {
      tickets.push(ticketServidor);
    }

    renderizarListaTickets();
    cancelarEdicion();

  } catch (error) {
    console.error("Error al guardar el ticket:", error);
  }
}

async function cambiarEstadoTicket(id, nuevoEstado) {
  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const ticketActualizado = await respuesta.json();

    const indice = tickets.findIndex(t => t.id === ticketActualizado.id);
    if (indice !== -1) tickets[indice] = ticketActualizado;

    renderizarListaTickets();

  } catch (error) {
    console.error("Error al actualizar estado:", error);
  }
}

async function eliminarTicket(id) {
  const confirmacion = confirm(`¿Estás seguro de que deseas eliminar el ticket #${id}?`);
  if (!confirmacion) return;

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    tickets = tickets.filter(ticket => ticket.id !== id);

    // Si el ticket eliminado estaba cargado en el formulario, cancelar edición
    if (ticketEnEdicionId === id) {
      cancelarEdicion();
    }

    renderizarListaTickets();

  } catch (error) {
    console.error("Error al eliminar el ticket:", error);
  }
}

document.addEventListener('DOMContentLoaded', cargarTickets);
formularioTickets.addEventListener('submit', guardarTicket);
botonCancelarTicket.addEventListener('click', cancelarEdicion);

if (filtroEstado) {
  filtroEstado.addEventListener('change', renderizarListaTickets);
}

if (campoBusqueda) {
  campoBusqueda.addEventListener('input', renderizarListaTickets);
}
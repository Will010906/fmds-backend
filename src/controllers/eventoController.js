// ============================================================================
// Controlador de Eventos
// ----------------------------------------------------------------------------
// Recibe las peticiones HTTP, llama al modelo y devuelve la respuesta JSON.
// Patrón CRUD estándar que se repite en varios controladores:
//   listar     -> GET  /            (todos)
//   obtener    -> GET  /:id         (uno)
//   crear      -> POST /            (nuevo)      [solo admin, ver rutas]
//   actualizar -> PUT  /:id         (editar)    [solo admin]
//   eliminar   -> DELETE /:id       (borrar)    [solo admin]
// Cada acción envuelve la consulta en try/catch para responder 500 ante errores.
// ============================================================================
const Evento = require('../models/eventoModel');
const { createEvento } = Evento;

// Devuelve la lista completa de eventos.
const listar = async (req, res) => {
  try {
    const eventos = await Evento.getAll();
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};

// Devuelve un evento por id; 404 si no existe.
const obtener = async (req, res) => {
  try {
    const evento = await Evento.getById(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener evento' });
  }
};

// Crea un evento con los datos del cuerpo de la petición. 201 = creado.
const crear = async (req, res) => {
  try {
    const id = await createEvento(req.body);
    res.status(201).json({ message: 'Evento creado', id });
  } catch (err) {
    console.error('ERROR CREAR EVENTO:', err);
    res.status(500).json({ error: 'Error al crear evento' });
  }
};

// Actualiza un evento; 404 si el id no existe (0 filas afectadas).
const actualizar = async (req, res) => {
  try {
    const filas = await Evento.update(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ message: 'Evento actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
};

// Elimina un evento; 404 si el id no existe.
const eliminar = async (req, res) => {
  try {
    const filas = await Evento.remove(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };

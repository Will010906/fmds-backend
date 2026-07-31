// ============================================================================
// Controlador de Paquetes
// ----------------------------------------------------------------------------
// Mismo patrón CRUD que sesionController: listar/obtener son públicos y
// crear/actualizar/eliminar quedan restringidos a admin en las rutas.
//
// La única particularidad es la validación: un paquete cuyo precio sea mayor o
// igual a comprar los boletos por separado no tendría sentido comercial y
// además haría que la página mostrara un "ahorro" negativo, así que se rechaza.
// ============================================================================
const Paquete = require('../models/paqueteModel');
const Evento = require('../models/eventoModel');

// Valida los datos de un paquete. Devuelve un mensaje de error o null si todo
// está bien. Se usa tanto al crear como al actualizar.
const validar = async (datos) => {
  const { idEvento, nombre, cantidadBoletos, precio } = datos;

  if (!idEvento || !nombre || !String(nombre).trim()) {
    return 'El evento y el nombre del paquete son obligatorios';
  }

  const cantidad = Number(cantidadBoletos);
  if (!Number.isInteger(cantidad) || cantidad < 2) {
    return 'Un paquete debe incluir al menos 2 boletos';
  }

  const monto = Number(precio);
  if (!Number.isFinite(monto) || monto <= 0) {
    return 'El precio del paquete debe ser mayor a cero';
  }

  const evento = await Evento.getById(idEvento);
  if (!evento) return 'El evento indicado no existe';

  const porSeparado = Number(evento.precio) * cantidad;
  if (monto >= porSeparado) {
    return `El paquete debe costar menos que comprar ${cantidad} boletos por separado ($${porSeparado})`;
  }

  return null;
};

// Devuelve todos los paquetes. Si se pasa ?idEvento=N, solo los activos de ese
// evento: es la forma que consume la página pública de registro.
const listar = async (req, res) => {
  try {
    const { idEvento } = req.query;
    const paquetes = idEvento
      ? await Paquete.getActivosPorEvento(idEvento)
      : await Paquete.getAll();
    res.json(paquetes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener paquetes' });
  }
};

// Devuelve un paquete por id; 404 si no existe.
const obtener = async (req, res) => {
  try {
    const paquete = await Paquete.getById(req.params.id);
    if (!paquete) return res.status(404).json({ error: 'Paquete no encontrado' });
    res.json(paquete);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener paquete' });
  }
};

// Crea un paquete con los datos del cuerpo.
const crear = async (req, res) => {
  try {
    const error = await validar(req.body);
    if (error) return res.status(400).json({ error });

    const id = await Paquete.createPaquete(req.body);
    res.status(201).json({ message: 'Paquete creado', id });
  } catch (err) {
    console.error('ERROR CREAR PAQUETE:', err);
    res.status(500).json({ error: 'Error al crear paquete' });
  }
};

// Actualiza un paquete; 404 si el id no existe.
const actualizar = async (req, res) => {
  try {
    const error = await validar(req.body);
    if (error) return res.status(400).json({ error });

    const filas = await Paquete.update(req.params.id, req.body);
    if (!filas) return res.status(404).json({ error: 'Paquete no encontrado' });
    res.json({ message: 'Paquete actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar paquete' });
  }
};

// Elimina un paquete; 404 si el id no existe.
const eliminar = async (req, res) => {
  try {
    const filas = await Paquete.remove(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Paquete no encontrado' });
    res.json({ message: 'Paquete eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar paquete' });
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };

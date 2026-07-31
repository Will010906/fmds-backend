// ============================================================================
// Modelo de Sesión / Agenda (capa de acceso a datos)
// ----------------------------------------------------------------------------
// Consultas SQL a la tabla `sesion`. Cada sesión es una actividad de la agenda
// del congreso, ubicada por `dia` (1, 2, 3...) y `hora`.
//
// Una sesión pertenece a un evento (`idEvento`) y puede estar impartida por un
// ponente registrado (`idSpeaker`). Ambas relaciones admiten nulos a propósito:
//   - `idEvento` porque la agenda existía antes de que hubiera varios eventos,
//     y las sesiones ya cargadas no tienen a cuál pertenecen hasta que alguien
//     lo indique desde el panel.
//   - `idSpeaker` porque no toda sesión la da una persona del catálogo: hay
//     paneles, comités y actividades abiertas. Para esos casos se conserva el
//     campo de texto `ponente`.
//
// Cuando la sesión sí está ligada a un ponente, las consultas devuelven su
// nombre, rol y foto, de modo que la agenda muestre siempre lo mismo que la
// página de ponentes y no dos versiones del mismo nombre.
// ============================================================================
const db = require('../config/db');

// Columnas de la sesión más los datos del ponente y del evento asociados.
// Se usa LEFT JOIN para que las sesiones sin ponente registrado o sin evento
// asignado sigan apareciendo.
const SELECT_BASE = `
  SELECT s.idSesion, s.idEvento, s.idSpeaker, s.dia, s.hora, s.duracion,
         s.tipo, s.nombre, s.ponente, s.badge,
         sp.nombre  AS speakerNombre,
         sp.rol     AS speakerRol,
         sp.fotoUrl AS speakerFoto,
         e.titulo   AS tituloEvento
  FROM sesion s
  LEFT JOIN speaker sp ON sp.idSpeaker = s.idSpeaker
  LEFT JOIN evento  e  ON e.idEvento   = s.idEvento
`;

// Devuelve todas las sesiones ordenadas por día y hora (orden cronológico).
const getAll = async () => {
  const [rows] = await db.query(`${SELECT_BASE} ORDER BY s.dia ASC, s.hora ASC`);
  return rows;
};

// Sesiones de un evento concreto. Las que aún no tienen evento asignado se
// incluyen para no dejar huecos en la agenda mientras se termina de capturar.
const getPorEvento = async (idEvento) => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE s.idEvento = ? OR s.idEvento IS NULL
     ORDER BY s.dia ASC, s.hora ASC`,
    [idEvento]
  );
  return rows;
};

// Sesiones que imparte un ponente registrado, para mostrarlas en su ficha.
const getPorSpeaker = async (idSpeaker) => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE s.idSpeaker = ? ORDER BY s.dia ASC, s.hora ASC`,
    [idSpeaker]
  );
  return rows;
};

// Devuelve una sesión por su id (o undefined si no existe).
const getById = async (id) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE s.idSesion = ?`, [id]);
  return rows[0];
};

// Normaliza las claves foráneas: el formulario envía cadena vacía cuando no se
// elige nada, y en la base de datos eso debe quedar como NULL.
const opcional = (valor) => (valor === '' || valor === undefined ? null : valor);

// Inserta una sesión nueva y devuelve el id generado.
const createSesion = async (datos) => {
  const { idEvento, idSpeaker, dia, hora, duracion, tipo, nombre, ponente, badge } = datos;
  const [result] = await db.query(
    `INSERT INTO sesion (idEvento, idSpeaker, dia, hora, duracion, tipo, nombre, ponente, badge)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    // El badge define el color en la agenda; "Keynote" es el valor por defecto.
    [opcional(idEvento), opcional(idSpeaker), dia, hora, duracion, tipo, nombre, ponente, badge || 'Keynote']
  );
  return result.insertId;
};

// Actualiza una sesión existente. Devuelve cuántas filas cambiaron.
const update = async (id, datos) => {
  const { idEvento, idSpeaker, dia, hora, duracion, tipo, nombre, ponente, badge } = datos;
  const [result] = await db.query(
    `UPDATE sesion SET idEvento=?, idSpeaker=?, dia=?, hora=?, duracion=?,
                       tipo=?, nombre=?, ponente=?, badge=?
     WHERE idSesion=?`,
    [opcional(idEvento), opcional(idSpeaker), dia, hora, duracion, tipo, nombre, ponente, badge || 'Keynote', id]
  );
  return result.affectedRows;
};

// Elimina una sesión. Devuelve cuántas filas se borraron.
const remove = async (id) => {
  const [result] = await db.query('DELETE FROM sesion WHERE idSesion = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getPorEvento, getPorSpeaker, getById, createSesion, update, remove };

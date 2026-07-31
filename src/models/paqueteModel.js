// ============================================================================
// Modelo de Paquete (capa de acceso a datos)
// ----------------------------------------------------------------------------
// Un paquete es un conjunto de boletos de un mismo evento con precio propio,
// normalmente menor que comprar esos boletos por separado. El ahorro no se
// guarda: se calcula comparando el precio del paquete contra el precio del
// evento multiplicado por la cantidad, así nunca puede quedar desactualizado.
//
// Todas las consultas devuelven también `precioEvento` para que quien las use
// pueda mostrar el precio de lista sin hacer una segunda consulta.
// ============================================================================
const db = require('../config/db');

// Columnas del paquete más el precio unitario de su evento.
const SELECT_BASE = `
  SELECT p.idPaquete, p.idEvento, p.nombre, p.descripcion, p.cantidadBoletos,
         p.precio, p.destacado, p.activo,
         e.titulo AS tituloEvento, e.precio AS precioEvento
  FROM paquete p
  JOIN evento e ON e.idEvento = p.idEvento
`;

// Todos los paquetes, incluidos los inactivos (para el panel de administración).
const getAll = async () => {
  const [rows] = await db.query(`${SELECT_BASE} ORDER BY p.idEvento, p.cantidadBoletos`);
  return rows;
};

// Solo los paquetes activos de un evento, para la página pública.
const getActivosPorEvento = async (idEvento) => {
  const [rows] = await db.query(
    `${SELECT_BASE} WHERE p.idEvento = ? AND p.activo = 1 ORDER BY p.cantidadBoletos`,
    [idEvento]
  );
  return rows;
};

// Devuelve un paquete por su id (o undefined si no existe).
// El checkout la usa para tomar el precio desde el servidor y no confiar en
// el importe que envíe el navegador.
const getById = async (id) => {
  const [rows] = await db.query(`${SELECT_BASE} WHERE p.idPaquete = ?`, [id]);
  return rows[0];
};

// Inserta un paquete nuevo y devuelve el id generado.
const createPaquete = async (datos) => {
  const { idEvento, nombre, descripcion, cantidadBoletos, precio, destacado, activo } = datos;
  const [result] = await db.query(
    `INSERT INTO paquete (idEvento, nombre, descripcion, cantidadBoletos, precio, destacado, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [idEvento, nombre, descripcion || null, cantidadBoletos, precio, destacado ? 1 : 0, activo === 0 ? 0 : 1]
  );
  return result.insertId;
};

// Actualiza un paquete existente. Devuelve cuántas filas cambiaron (0 si el id no existe).
const update = async (id, datos) => {
  const { idEvento, nombre, descripcion, cantidadBoletos, precio, destacado, activo } = datos;
  const [result] = await db.query(
    `UPDATE paquete
     SET idEvento=?, nombre=?, descripcion=?, cantidadBoletos=?, precio=?, destacado=?, activo=?
     WHERE idPaquete=?`,
    [idEvento, nombre, descripcion || null, cantidadBoletos, precio, destacado ? 1 : 0, activo === 0 ? 0 : 1, id]
  );
  return result.affectedRows;
};

// Elimina un paquete. Devuelve cuántas filas se borraron (0 si el id no existe).
const remove = async (id) => {
  const [result] = await db.query('DELETE FROM paquete WHERE idPaquete = ?', [id]);
  return result.affectedRows;
};

module.exports = { getAll, getActivosPorEvento, getById, createPaquete, update, remove };

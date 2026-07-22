// ============================================================================
// Controlador de Usuarios (gestión desde el panel de administración)
// ----------------------------------------------------------------------------
// Todas las acciones son solo para administradores (ver rutas). Incluye
// protecciones para que un admin no se modifique/elimine a sí mismo por error.
// ============================================================================
const Usuario = require('../models/usuarioModel');

// Roles permitidos en el sistema. Se valida contra esta lista al cambiar el rol.
const ROLES_VALIDOS = ['Usuario General', 'Administrador'];

// Devuelve la lista de usuarios (solo admin).
const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Cambia el rol de un usuario (por ejemplo, promover a Administrador).
const cambiarRol = async (req, res) => {
  const { rol } = req.body;
  const id = parseInt(req.params.id);

  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
  // req.usuario.id viene del token (ver authMiddleware). Un admin no puede
  // quitarse su propio rol, para no quedarse sin acceso de administrador.
  if (id === req.usuario.id) {
    return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
  }

  try {
    const filas = await Usuario.updateRol(id, rol);
    if (!filas) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Rol actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

// Elimina un usuario.
const eliminar = async (req, res) => {
  const id = parseInt(req.params.id);

  // Un admin tampoco puede eliminar su propia cuenta.
  if (id === req.usuario.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  }

  try {
    const filas = await Usuario.remove(id);
    if (!filas) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    // Si el usuario tiene transacciones asociadas, la llave foránea impide
    // borrarlo (ER_ROW_IS_REFERENCED_2). Se responde 409 en vez de un 500 genérico.
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'No se puede eliminar: el usuario tiene compras registradas' });
    }
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = { listar, cambiarRol, eliminar };

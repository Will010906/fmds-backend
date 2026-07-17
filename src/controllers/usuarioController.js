const Usuario = require('../models/usuarioModel');

const ROLES_VALIDOS = ['Usuario General', 'Administrador'];

const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const cambiarRol = async (req, res) => {
  const { rol } = req.body;
  const id = parseInt(req.params.id);

  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }
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

const eliminar = async (req, res) => {
  const id = parseInt(req.params.id);

  if (id === req.usuario.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  }

  try {
    const filas = await Usuario.remove(id);
    if (!filas) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'No se puede eliminar: el usuario tiene compras registradas' });
    }
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

module.exports = { listar, cambiarRol, eliminar };

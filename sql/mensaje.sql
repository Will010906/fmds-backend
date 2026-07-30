-- Mensajes recibidos desde el formulario de contacto del sitio.
CREATE TABLE IF NOT EXISTS mensaje (
  idMensaje INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(150) NOT NULL,
  correo    VARCHAR(150) NOT NULL,
  asunto    VARCHAR(60)  NOT NULL DEFAULT 'Consulta general',
  mensaje   TEXT NOT NULL,
  creadoEn  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

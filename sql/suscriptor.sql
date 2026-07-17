-- Tabla para el boletín académico (formulario de suscripción del sitio).
CREATE TABLE IF NOT EXISTS suscriptor (
  idSuscriptor INT AUTO_INCREMENT PRIMARY KEY,
  correo       VARCHAR(150) NOT NULL UNIQUE,
  creadoEn     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

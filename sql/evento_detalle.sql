-- Migración: campos descriptivos del evento para la página pública de detalle.
-- Antes el evento solo tenía titulo, fecha, precio y stock, por lo que el sitio
-- no podía informar dónde ni a qué hora se realiza.
ALTER TABLE evento
  ADD COLUMN descripcion TEXT NULL,
  ADD COLUMN sede        VARCHAR(150) NULL,
  ADD COLUMN ciudad      VARCHAR(100) NULL,
  ADD COLUMN hora        TIME NULL,
  ADD COLUMN modalidad   VARCHAR(30) NOT NULL DEFAULT 'Presencial';

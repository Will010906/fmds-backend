-- Agrega la columna de foto a speakers. Si está vacía, el frontend
-- muestra un avatar con iniciales como placeholder.
ALTER TABLE speaker ADD COLUMN fotoUrl VARCHAR(500) NULL;

-- Permite compras sin cuenta: el checkout crea una cuenta "invitada"
-- ligada al correo del comprador. Si después esa persona se registra
-- con el mismo correo, reclama la cuenta y conserva su historial.
ALTER TABLE usuario ADD COLUMN esInvitado TINYINT(1) NOT NULL DEFAULT 0;

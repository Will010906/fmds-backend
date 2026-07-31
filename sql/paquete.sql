-- ============================================================================
-- Tabla: paquete
-- ----------------------------------------------------------------------------
-- Conjunto de boletos de un mismo evento vendido con un precio propio, menor
-- que comprar esos boletos por separado.
--
-- El ahorro no se almacena: se calcula como (evento.precio * cantidadBoletos)
-- menos paquete.precio, de modo que si la federación cambia el precio del
-- boleto, el ahorro mostrado se recalcula solo y nunca queda desfasado.
--
-- El servidor toma el precio de esta tabla al cobrar, así que el importe no
-- depende de lo que envíe el navegador.
-- ============================================================================

CREATE TABLE IF NOT EXISTS paquete (
    idPaquete       INT AUTO_INCREMENT PRIMARY KEY,
    idEvento        INT NOT NULL,
    nombre          VARCHAR(100)  NOT NULL,
    descripcion     VARCHAR(255)  NULL,
    cantidadBoletos INT           NOT NULL,
    precio          DECIMAL(10,2) NOT NULL,
    destacado       TINYINT(1)    NOT NULL DEFAULT 0,  -- muestra la etiqueta "Más elegido"
    activo          TINYINT(1)    NOT NULL DEFAULT 1,  -- permite ocultarlo sin borrarlo
    CONSTRAINT FK_paquete_evento FOREIGN KEY (idEvento)
        REFERENCES evento(idEvento) ON DELETE CASCADE,
    CONSTRAINT CHK_paquete_cantidad CHECK (cantidadBoletos >= 2),
    CONSTRAINT CHK_paquete_precio   CHECK (precio > 0)
) ENGINE=InnoDB;

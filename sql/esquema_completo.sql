-- ====================================================================
-- ESQUEMA COMPLETO DE LA BASE DE DATOS - PLATAFORMA WEB FMDS
-- AUTOR: LOBATO ALCANTAR WILMER ERNESTO
-- ECOSISTEMA: MYSQL + NODE.JS + OPENPAY
--
-- Script consolidado de las nueve tablas del sistema. Refleja el estado
-- final del esquema en produccion, incluyendo las columnas agregadas por
-- migraciones incrementales (usuario.esInvitado, speaker.fotoUrl).
-- Los scripts individuales de este directorio documentan cada migracion.
-- ====================================================================
CREATE DATABASE IF NOT EXISTS fmds_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fmds_db;

-- 1. TABLA: usuario (entidad central de accesos y roles)
--    esInvitado = 1 cuando la cuenta se creo automaticamente en una compra
--    sin registro; se reclama al registrarse con el mismo correo.
CREATE TABLE IF NOT EXISTS usuario (
    idUsuario INT AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasenia VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL DEFAULT 'Usuario General',
    esInvitado TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT PK_usuario PRIMARY KEY (idUsuario)
) ENGINE=InnoDB;

-- 2. TABLA: evento (congresos con precio y control de inventario de boletos)
CREATE TABLE IF NOT EXISTS evento (
    idEvento INT AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,
    precio FLOAT NOT NULL,
    stockBoletos INT NOT NULL,
    CONSTRAINT PK_evento PRIMARY KEY (idEvento),
    CONSTRAINT CHK_precio_positivo CHECK (precio >= 0),
    CONSTRAINT CHK_stock_positivo CHECK (stockBoletos >= 0)
) ENGINE=InnoDB;

-- 3. TABLA: transaccion (folio financiero generado al confirmarse el cargo)
CREATE TABLE IF NOT EXISTS transaccion (
    idTransaccion VARCHAR(50) NOT NULL,
    idUsuario INT NOT NULL,
    fechaPago DATETIME NOT NULL,
    montoTotal FLOAT NOT NULL,
    CONSTRAINT PK_transaccion PRIMARY KEY (idTransaccion),
    CONSTRAINT FK_transaccion_usuario FOREIGN KEY (idUsuario)
        REFERENCES usuario (idUsuario) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT CHK_monto_positivo CHECK (montoTotal >= 0)
) ENGINE=InnoDB;

-- 4. TABLA: detalle_compra (entidad asociativa que rompe la relacion n:m
--    entre transacciones y eventos)
CREATE TABLE IF NOT EXISTS detalle_compra (
    idDetalle INT AUTO_INCREMENT,
    idTransaccion VARCHAR(50) NOT NULL,
    idEvento INT NOT NULL,
    cantidad INT NOT NULL,
    CONSTRAINT PK_detalle_compra PRIMARY KEY (idDetalle),
    CONSTRAINT FK_detalle_transaccion FOREIGN KEY (idTransaccion)
        REFERENCES transaccion (idTransaccion) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_detalle_evento FOREIGN KEY (idEvento)
        REFERENCES evento (idEvento) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT CHK_cantidad_valida CHECK (cantidad > 0)
) ENGINE=InnoDB;

-- 5. TABLA: articulo (repositorio de divulgacion cientifica)
CREATE TABLE IF NOT EXISTS articulo (
    idArticulo INT AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    cuerpo TEXT NOT NULL,
    autor VARCHAR(150) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    fechaPublicacion DATE NOT NULL,
    CONSTRAINT PK_articulo PRIMARY KEY (idArticulo)
) ENGINE=InnoDB;

-- 6. TABLA: speaker (ponentes del congreso; featured = keynote destacado)
CREATE TABLE IF NOT EXISTS speaker (
    idSpeaker INT AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(150) NOT NULL,
    rol       VARCHAR(150) NOT NULL,
    area      VARCHAR(60)  NOT NULL,
    tema      VARCHAR(255) NOT NULL,
    frase     TEXT NULL,
    featured  TINYINT(1) NOT NULL DEFAULT 0,
    fotoUrl   VARCHAR(500) NULL,
    creadoEn  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. TABLA: suscriptor (correos captados por el boletin del sitio)
CREATE TABLE IF NOT EXISTS suscriptor (
    idSuscriptor INT AUTO_INCREMENT PRIMARY KEY,
    correo       VARCHAR(150) NOT NULL UNIQUE,
    creadoEn     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. TABLA: sesion (agenda del congreso por dia y hora;
--    badge: Keynote | Workshop | Panel | Social)
CREATE TABLE IF NOT EXISTS sesion (
    idSesion  INT AUTO_INCREMENT PRIMARY KEY,
    idEvento  INT NULL,          -- a que congreso pertenece esta sesion
    idSpeaker INT NULL,          -- ponente del catalogo, si lo imparte una persona registrada
    dia       INT NOT NULL,
    hora      TIME NOT NULL,
    duracion  VARCHAR(20) NOT NULL,
    tipo      VARCHAR(60) NOT NULL,
    nombre    VARCHAR(255) NOT NULL,
    -- Texto libre para lo que no es una persona del catalogo: paneles,
    -- comites y actividades abiertas a todos los asistentes.
    ponente   VARCHAR(150) NOT NULL,
    badge     VARCHAR(20) NOT NULL DEFAULT 'Keynote',
    CONSTRAINT FK_sesion_evento  FOREIGN KEY (idEvento)  REFERENCES evento(idEvento)   ON DELETE SET NULL,
    CONSTRAINT FK_sesion_speaker FOREIGN KEY (idSpeaker) REFERENCES speaker(idSpeaker) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. TABLA: curso (catalogo de formacion en linea;
--    badge: 'Nuevo' | 'Popular' | NULL)
CREATE TABLE IF NOT EXISTS curso (
    idCurso     INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    horas       INT NOT NULL,
    nivel       VARCHAR(50) NOT NULL,
    precio      DECIMAL(10,2) NOT NULL,
    descripcion TEXT NOT NULL,
    badge       VARCHAR(20) NULL
) ENGINE=InnoDB;

-- 10. TABLA: paquete (conjunto de boletos de un evento con precio propio,
--     menor que comprar esos boletos por separado. El ahorro no se guarda:
--     se calcula contra evento.precio para que nunca quede desfasado)
CREATE TABLE IF NOT EXISTS paquete (
    idPaquete       INT AUTO_INCREMENT PRIMARY KEY,
    idEvento        INT NOT NULL,
    nombre          VARCHAR(100)  NOT NULL,
    descripcion     VARCHAR(255)  NULL,
    cantidadBoletos INT           NOT NULL,
    precio          DECIMAL(10,2) NOT NULL,
    destacado       TINYINT(1)    NOT NULL DEFAULT 0,
    activo          TINYINT(1)    NOT NULL DEFAULT 1,
    CONSTRAINT FK_paquete_evento FOREIGN KEY (idEvento)
        REFERENCES evento(idEvento) ON DELETE CASCADE,
    CONSTRAINT CHK_paquete_cantidad CHECK (cantidadBoletos >= 2),
    CONSTRAINT CHK_paquete_precio   CHECK (precio > 0)
) ENGINE=InnoDB;

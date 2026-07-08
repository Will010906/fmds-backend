-- Ejecutar este script en la base de datos del backend (fmds_db) para
-- habilitar la gestión de Speakers desde el panel Admin.

CREATE TABLE IF NOT EXISTS speaker (
  idSpeaker INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(150) NOT NULL,
  rol       VARCHAR(150) NOT NULL,
  area      VARCHAR(60)  NOT NULL,
  tema      VARCHAR(255) NOT NULL,
  frase     TEXT NULL,
  featured  TINYINT(1) NOT NULL DEFAULT 0,
  creadoEn  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales (los mismos que ya se mostraban en la página, para no perder contenido)
INSERT INTO speaker (nombre, rol, area, tema, frase, featured) VALUES
('Dr. Alejandro Ramírez', 'Director de Investigación · UNAM', 'Arquitectura', 'Microservicios y arquitectura cloud-native a escala nacional', NULL, 0),
('Sofía Castro', 'Investigadora Senior · UNAM', 'IA Aplicada', 'Inteligencia artificial en el desarrollo de software moderno', NULL, 0),
('Dr. Fernando Méndez', 'Director de Innovación · IPN · Arquitectura Cloud', 'Keynote', 'El futuro del software mexicano en el escenario global', 'El software mexicano está listo para competir a nivel global. Solo necesitamos los espacios correctos para demostrarlo.', 1),
('Miguel Reyes', 'CTO · FinTech México', 'DevOps', 'CI/CD y cultura DevOps en equipos distribuidos', NULL, 0),
('Ana López', 'Security Lead · TEC Monterrey', 'Security', 'Ciberseguridad en aplicaciones REST modernas', NULL, 0),
('Jorge Mendoza', 'Cloud Architect · Google México', 'Cloud', 'Cloud-native para startups', NULL, 0),
('Laura Vega', 'Design Lead · Clip México', 'UX', 'Diseño de producto a escala', NULL, 0);

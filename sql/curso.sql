-- Cursos en línea, gestionables desde el panel Admin.
-- badge: 'Nuevo' | 'Popular' | NULL
CREATE TABLE IF NOT EXISTS curso (
  idCurso     INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  horas       INT NOT NULL,
  nivel       VARCHAR(50) NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  descripcion TEXT NOT NULL,
  badge       VARCHAR(20) NULL
);

-- Catálogo actual (el que ya se mostraba en el sitio)
INSERT INTO curso (nombre, horas, nivel, precio, descripcion, badge) VALUES
('Node.js y Express para APIs', 24, 'Intermedio', 450, 'Construye APIs REST robustas con Node.js, Express, JWT y MySQL. Proyecto final con certificado incluido.', 'Nuevo'),
('MySQL Avanzado', 18, 'Básico–Intermedio', 380, 'Diseño de bases de datos relacionales, normalización, queries avanzados y optimización de rendimiento.', 'Popular'),
('UI/UX para Desarrolladores', 16, 'Básico', 320, 'De wireframe a prototipo en Figma. Principios de diseño aplicados para equipos de desarrollo.', NULL),
('Docker y Kubernetes desde Cero', 20, 'Intermedio', 420, 'Contenerización de aplicaciones, orquestación y despliegue en clústeres para equipos pequeños.', 'Popular'),
('Machine Learning Aplicado', 30, 'Avanzado', 550, 'Modelos supervisados y no supervisados con Python y scikit-learn, aplicados a casos reales.', 'Nuevo'),
('Ciberseguridad en APIs REST', 22, 'Intermedio', 400, 'Autenticación, autorización, Zero Trust y mitigación de vulnerabilidades comunes en producción.', NULL);

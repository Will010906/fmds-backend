-- Sesiones de la agenda del congreso, gestionables desde el panel Admin.
-- badge: Keynote | Workshop | Panel | Social (define el color en el frontend)
CREATE TABLE IF NOT EXISTS sesion (
  idSesion  INT AUTO_INCREMENT PRIMARY KEY,
  dia       INT NOT NULL,
  hora      TIME NOT NULL,
  duracion  VARCHAR(20) NOT NULL,
  tipo      VARCHAR(60) NOT NULL,
  nombre    VARCHAR(255) NOT NULL,
  ponente   VARCHAR(150) NOT NULL,
  badge     VARCHAR(20) NOT NULL DEFAULT 'Keynote'
);

-- Programa actual (el que ya se mostraba en el sitio)
INSERT INTO sesion (dia, hora, duracion, tipo, nombre, ponente, badge) VALUES
(1, '09:00', '90 min', 'Keynote de apertura',   'La nueva era del software mexicano',                    'Dr. Alejandro Ramírez · UNAM',        'Keynote'),
(1, '11:00', '60 min', 'Workshop técnico',      'Arquitectura de microservicios con Node.js y Docker',   'Ing. Mario Torres · Microsoft México', 'Workshop'),
(1, '13:00', '60 min', 'Panel de discusión',    'IA en el desarrollo: oportunidades y riesgos reales',   'Panel con 4 ponentes internacionales', 'Panel'),
(1, '15:30', '90 min', 'Conferencia magistral', 'Seguridad en APIs REST: del JWT al Zero Trust',         'Dra. Ana López · TEC de Monterrey',    'Keynote'),
(1, '17:30', '45 min', 'Workshop práctico',     'CI/CD con GitHub Actions: de cero a producción',        'Miguel Reyes · FinTech México',        'Workshop'),
(1, '19:00', '60 min', 'Cierre del día',        'Networking & Feria de proyectos estudiantiles',         'Todos los asistentes',                 'Social'),
(2, '09:00', '90 min', 'Keynote',               'El futuro de la IA en México',                          'Dra. Sofía Castro · UNAM',             'Keynote'),
(2, '11:00', '60 min', 'Workshop técnico',      'Vue.js 3 + TypeScript en producción',                   'Ing. Luis Herrera · Google México',    'Workshop'),
(2, '13:00', '60 min', 'Panel de discusión',    'Startups de software: casos de éxito nacionales',       'Panel con 5 fundadores',               'Panel'),
(2, '15:30', '90 min', 'Conferencia magistral', 'Machine Learning aplicado al desarrollo ágil',          'Dr. Fernando Méndez · IPN',            'Keynote'),
(2, '17:30', '45 min', 'Workshop práctico',     'Docker + Kubernetes para equipos pequeños',             'Carlos Vega · AWS México',             'Workshop'),
(2, '19:00', '60 min', 'Cierre del día',        'Cena de networking y premiación parcial',               'Todos los asistentes',                 'Social'),
(3, '09:00', '60 min', 'Keynote de cierre',     'Hacia una federación sólida de software en México',     'Comité directivo FMDS',                'Keynote'),
(3, '10:30', '90 min', 'Feria de proyectos',    'Presentación de proyectos estudiantiles',               'Equipos inscritos',                    'Social'),
(3, '13:00', '60 min', 'Workshop técnico',      'Publicación de artículos científicos paso a paso',      'Comité editorial FMDS',                'Workshop'),
(3, '15:00', '90 min', 'Ceremonia de clausura', 'Premiación hackathon + mejores ponencias',              'Todos los asistentes',                 'Keynote');


HR – MVP de Selección de Personal

Este repositorio contiene un MVP (Producto Mínimo Viable) para gestión de candidatos y procesos de selección.  
El objetivo es ofrecer una plataforma simple y escalable donde los reclutadores puedan cargar CVs directamente, filtrar candidatos por criterios básicos y validar la lógica de selección con datos reales.

---

🚀 Características principales
- Carga directa de CVs en PDF/Word.
- Gestión de perfiles unificados en una sola tabla (profiles) con roles de candidato y reclutador.
- Autenticación segura con contraseñas hasheadas.
- Endpoints REST para:
  - Alta de candidatos
  - Listado y filtrado por skills/experiencia
  - Gestión de reclutadores
- Arquitectura escalable pensada para migrar fácilmente a Supabase u otros servicios cloud.

---

📦 Instalación y ejecución

Requisitos
- Node.js >= 18
- MongoDB o Supabase (según configuración)
- npm o yarn

Pasos
1. Clonar el repositorio:
   `bash
   git clone https://github.com/Turiella/HR.git
   cd HR
   `
2. Instalar dependencias:
   `bash
   npm install
   `
3. Configurar variables de entorno en .env:
   `env
   DB_URI=mongodb://localhost:27017/hr
   JWTSECRET=tusecreto_seguro
   `
4. Ejecutar el servidor:
   `bash
   npm run dev
   `

---

📂 Estructura del proyecto
`
HR/
├── src/
│   ├── models/        # Definición de esquemas (profiles, candidatos, reclutadores)
│   ├── routes/        # Endpoints REST
│   ├── controllers/   # Lógica de negocio
│   └── utils/         # Helpers (hashing, validaciones)
├── tests/             # Pruebas unitarias
├── README.md
└── package.json
`

---

🧪 Ejemplo de uso

Crear candidato
`http
POST /api/candidates
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "skills": ["React", "Node.js", "MongoDB"],
  "experience": "3 años"
}
`

Listar candidatos filtrados
`http
GET /api/candidates?skills=React
`

---

🛠 Roadmap
- [ ] Frontend mínimo en React para carga y visualización de candidatos
- [ ] Integración con Supabase para almacenamiento de CVs
- [ ] Filtros avanzados (años de experiencia, educación, ubicación)
- [ ] Dashboard para reclutadores con métricas básicas
- [ ] Integración con APIs de análisis de CV (OpenAI)

---

🤝 Contribuciones
Las contribuciones son bienvenidas.  
Por favor, abre un issue o envía un pull request con mejoras.

---

📄 Licencia
Este proyecto está bajo la licencia MIT.  
Puedes usarlo, modificarlo y distribuirlo libremente.
# Contexto del Proyecto: App de Gestión del Tiempo

## Descripción General
Aplicación web de gestión del tiempo personal. Permite a usuarios organizar su día, trackear hábitos, establecer metas semanales y visualizar su progreso. El proyecto tiene un enfoque especial en la experiencia de usuario con temas personalizables (masculino/femenino) y modo oscuro.

## Estructura del Proyecto

```
app-gestion-tiempo/
├── index.html          # Landing page pública
├── login.html          # Página de inicio de sesión
├── onboarding.html     # Flujo de onboarding para nuevos usuarios
├── app.html            # App principal (dashboard, hábitos, agenda, metas)
├── backoffice.html     # Panel de administración
├── admin-login.html    # Login para administradores
├── arantxa.html        # Página personalizada (demo)
├── vercel.json         # Configuración de despliegue en Vercel
└── frappe-backend/     # Backend con Frappe Framework
    ├── docker-compose.yml
    └── INSTALACION.md
```

## Stack Tecnológico

### Frontend
- **HTML5** con JavaScript vanilla (archivos monolíticos)
- **Tailwind CSS** (via CDN)
- **Fuente:** Poppins (Google Fonts)
- **Extras:** Tesseract.js para OCR
- **Despliegue:** Vercel

### Backend
- **Frappe Framework** (Python)
- **Docker** para contenedores
- **Base de datos:** MariaDB (dentro de Docker)
- **Puerto:** 8080

## DocTypes del Backend (API)

| DocType | Descripción |
|---------|-------------|
| GT User | Usuarios de la app (email, nombre, goal, preferencias) |
| GT Habit | Hábitos diarios (icon, name, date, completed) |
| GT Schedule | Agenda/actividades (date, time, activity, duration, category) |
| GT Goal | Metas semanales (física, personal, digital, espiritual) |

### Endpoints API
```
POST /api/method/frappe.auth.login
GET  /api/resource/GT User
POST /api/resource/GT User
GET  /api/resource/GT Habit?filters=[["user","=","email"]]
POST /api/resource/GT Habit
GET  /api/resource/GT Schedule
POST /api/resource/GT Schedule
```

## Convenciones de Código

### CSS
- Variables CSS para temas: `--theme-primary`, `--theme-secondary`, `--theme-accent`
- Tema femenino (default): rosa/morado (`#ec4899`, `#8b5cf6`)
- Tema masculino: azul/cyan (`#3b82f6`, `#06b6d4`)
- Clase `dark` en body para modo oscuro
- Clases utilitarias de Tailwind

### JavaScript
- Todo inline en los archivos HTML
- LocalStorage para persistencia del lado cliente
- Funciones principales: `loadHabits()`, `loadSchedule()`, `loadGoals()`, `saveData()`

## Flujo de Usuario
1. **Landing** (`index.html`) → Presenta la app
2. **Login** (`login.html`) → Autenticación
3. **Onboarding** (`onboarding.html`) → Configura objetivo, duración, preferencias
4. **App** (`app.html`) → Dashboard principal con tabs:
   - Inicio (resumen del día)
   - Hábitos (check diario)
   - Agenda (actividades programadas)
   - Metas (objetivos semanales por categoría)
   - Configuración

## Notas Importantes
- Los archivos HTML son monolíticos (todo el JS/CSS está inline)
- El archivo `app.html` es el más grande (~529KB) - contiene toda la lógica de la app
- El backend Frappe aún está en fase de configuración
- El frontend actualmente usa localStorage como fallback cuando no hay backend

## Tareas Comunes

### Agregar nuevo hábito predefinido
Buscar el array de hábitos en `app.html` y agregar el nuevo objeto.

### Modificar colores del tema
Editar las variables CSS en `:root` y `.theme-male` en `app.html`.

### Agregar nuevo endpoint
1. Crear DocType en Frappe
2. Agregar función fetch en el frontend
3. Manejar respuesta y actualizar UI

## Agent Team Commands

| Command | Role | Use |
|---------|------|-----|
| `/po` | Product Owner | Roadmap, backlog, priorización |
| `/ux` | UX/UI Designer | Diseño de interfaces, prototipos |
| `/tech-lead` | Tech Lead | Decisiones técnicas, arquitectura |
| `/fullstack` | Full Stack Developer | Desarrollo general |
| `/frontend` | Frontend Developer | HTML/CSS/JS, UI |
| `/backend` | Backend Developer | Frappe, API, Docker |
| `/qa` | QA Engineer | Testing, validación |
| `/devops` | DevOps / SRE | Vercel, Docker, despliegue |
| `/ai-engineer` | AI/Prompt Engineer | Integraciones con AI |
| `/team` | Team Coordinator | Coordinación entre agentes |
| `/sprint` | Sprint Manager | Planificación de sprints |
| `/handoff` | Handoff Manager | Transferencia entre agentes |

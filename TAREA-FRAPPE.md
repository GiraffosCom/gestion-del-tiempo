# Tarea: Conectar App con Backend Frappe

## Objetivo
Conectar el frontend de la app de gestión del tiempo con una nueva instancia de Frappe para persistir los datos en una base de datos real (actualmente usa localStorage).

## Contexto Actual
- El frontend está en archivos HTML con JavaScript vanilla
- Los datos se guardan en localStorage (temporal, se pierde)
- Ya existe configuración de Docker en `/frappe-backend`
- Los DocTypes necesarios están documentados en `frappe-backend/INSTALACION.md`

## Lo que necesito que hagas

### Fase 1: Verificar/Actualizar Docker Compose
1. Revisar `frappe-backend/docker-compose.yml`
2. Asegurar que esté actualizado para Frappe v15
3. Configurar variables de entorno para producción

### Fase 2: Crear módulo de API en el frontend
Crear un archivo `api.js` o módulo dentro de `app.html` que maneje:

```javascript
const API = {
    baseUrl: 'http://69.48.200.216:8080',

    // Autenticación
    async login(email, password) { ... },
    async logout() { ... },

    // Usuarios
    async createUser(data) { ... },
    async getUser(email) { ... },
    async updateUser(email, data) { ... },

    // Hábitos
    async getHabits(userEmail, date) { ... },
    async createHabit(data) { ... },
    async updateHabit(id, data) { ... },
    async deleteHabit(id) { ... },

    // Agenda
    async getSchedule(userEmail, date) { ... },
    async createScheduleItem(data) { ... },
    async updateScheduleItem(id, data) { ... },
    async deleteScheduleItem(id) { ... },

    // Metas
    async getGoals(userEmail, week) { ... },
    async saveGoals(data) { ... },

    // Gastos
    async getExpenses(userEmail, month) { ... },
    async createExpense(data) { ... },
    async updateExpense(id, data) { ... },
    async deleteExpense(id) { ... }
};
```

### Fase 3: Modificar funciones existentes
Actualizar las funciones en `app.html` para usar la API:

| Función actual | Cambio necesario |
|----------------|------------------|
| `getHabits()` | Llamar `API.getHabits()` con fallback a localStorage |
| `saveHabits()` | Llamar `API.createHabit()` o `API.updateHabit()` |
| `getSchedule()` | Llamar `API.getSchedule()` |
| `getExpenses()` | Llamar `API.getExpenses()` |
| `saveExpenses()` | Llamar `API.createExpense()` |

### Fase 4: Manejo de sesión
1. Guardar token de autenticación en localStorage
2. Incluir token en headers de cada request
3. Manejar expiración de sesión
4. Sincronizar datos locales con servidor al reconectar

## DocTypes a crear en Frappe

### GT User
```
email (Data, Primary)
full_name (Data)
password_hash (Password)
goal (Data)
duration (Int)
start_date (Date)
preferences (JSON)
onboarding_completed (Check)
```

### GT Habit
```
user (Link → GT User)
icon (Data)
name (Data)
date (Date)
completed (Check)
```

### GT Schedule
```
user (Link → GT User)
date (Date)
time (Data)
activity (Data)
duration (Data)
category (Data)
completed (Check)
```

### GT Goal
```
user (Link → GT User)
week (Int)
dates (Data)
fisica (Data)
personal (Data)
digital (Data)
espiritual (Data)
```

### GT Expense (nuevo)
```
user (Link → GT User)
date (Date)
store (Data)
total (Currency)
category (Data)
description (Text)
```

## Endpoints de Frappe

```
POST /api/method/login
     Body: { usr, pwd }

GET  /api/resource/GT User/{email}
POST /api/resource/GT User
     Body: { email, full_name, ... }

GET  /api/resource/GT Habit?filters=[["user","=","email"],["date","=","2024-01-15"]]
POST /api/resource/GT Habit
PUT  /api/resource/GT Habit/{name}
DELETE /api/resource/GT Habit/{name}

# Similar para GT Schedule, GT Goal, GT Expense
```

## Configuración CORS en Frappe
```bash
bench --site gestion.localhost set-config allow_cors "*"
bench --site gestion.localhost set-config ignore_csrf 1
```

## Notas importantes
- Mantener fallback a localStorage cuando no hay conexión
- Implementar sync offline → online
- Manejar errores de red gracefully
- Mostrar indicador de "guardando..." / "sincronizando..."

## IP del servidor
```
IP: 69.48.200.216
URL Base API: http://69.48.200.216:8080
```

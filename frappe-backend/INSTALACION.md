# Instalación de Frappe Backend para Gestión del Tiempo

## Requisitos
- Docker y Docker Compose instalados
- Puerto 8080 disponible
- Mínimo 4GB RAM

## Pasos de Instalación

### 1. Copiar archivos al servidor
```bash
scp -r frappe-backend/ usuario@TU_IP:/home/usuario/
```

### 2. En el servidor, iniciar los contenedores
```bash
cd frappe-backend
docker-compose up -d
```

### 3. Esperar a que se cree el sitio (3-5 minutos)
```bash
docker-compose logs -f create-site
```
Cuando veas "Site gestion.localhost created", presiona Ctrl+C.

### 4. Acceder a Frappe
- URL: http://TU_IP:8080
- Usuario: Administrator
- Contraseña: admin123

## Crear la App de Gestión del Tiempo

### 5. Entrar al contenedor
```bash
docker-compose exec backend bash
```

### 6. Crear la app personalizada
```bash
bench new-app gestion_tiempo
```
Responde a las preguntas:
- App Title: Gestión del Tiempo
- App Description: Backend para app de gestión del tiempo
- App Publisher: Tu nombre
- App Email: tu@email.com
- App License: MIT

### 7. Instalar la app en el sitio
```bash
bench --site gestion.localhost install-app gestion_tiempo
```

### 8. Crear los DocTypes (desde la interfaz de Frappe)

Accede a http://TU_IP:8080 y crea estos DocTypes:

#### DocType: GT User (Usuario de Gestión del Tiempo)
Campos:
| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| email | Data | Sí |
| full_name | Data | Sí |
| password_hash | Password | Sí |
| goal | Data | No |
| duration | Int | No |
| start_date | Date | No |
| preferences | JSON | No |
| onboarding_completed | Check | No |

#### DocType: GT Habit (Hábitos)
Campos:
| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| user | Link (GT User) | Sí |
| icon | Data | No |
| name | Data | Sí |
| date | Date | Sí |
| completed | Check | No |

#### DocType: GT Schedule (Agenda)
Campos:
| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| user | Link (GT User) | Sí |
| date | Date | Sí |
| time | Data | Sí |
| activity | Data | Sí |
| duration | Data | No |
| category | Data | No |
| completed | Check | No |

#### DocType: GT Goal (Metas Semanales)
Campos:
| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| user | Link (GT User) | Sí |
| week | Int | Sí |
| dates | Data | No |
| fisica | Data | No |
| personal | Data | No |
| digital | Data | No |
| espiritual | Data | No |

## Habilitar API REST

### 9. Configurar CORS (importante para el frontend)
En el contenedor backend:
```bash
bench --site gestion.localhost set-config allow_cors "*"
bench --site gestion.localhost set-config ignore_csrf 1
```

### 10. Crear usuario API
En Frappe, ve a:
- User → New User
- Email: api@gestion-tiempo.com
- Roles: System Manager
- API Access → Generate Keys

Guarda el API Key y API Secret.

## URLs de la API

Una vez configurado, la API estará disponible en:

```
POST http://TU_IP:8080/api/method/frappe.auth.login
GET  http://TU_IP:8080/api/resource/GT User
POST http://TU_IP:8080/api/resource/GT User
GET  http://TU_IP:8080/api/resource/GT Habit?filters=[["user","=","email@usuario.com"]]
POST http://TU_IP:8080/api/resource/GT Habit
```

## Siguiente Paso

Una vez que tengas Frappe corriendo y los DocTypes creados, dame:
1. La IP de tu servidor
2. El API Key y Secret

Y modifico el frontend para conectarse a tu servidor.

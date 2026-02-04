# Frappe + ERPNext en Coolify

## Instalación en Coolify

### Paso 1: Crear nuevo proyecto en Coolify
1. Ve a tu dashboard de Coolify
2. Click en **+ Add New Resource**
3. Selecciona **Docker Compose**

### Paso 2: Configurar
1. Sube o pega el contenido de `docker-compose.yml`
2. En **Environment Variables**, agrega:

```
DB_ROOT_PASSWORD=tu_password_seguro
ADMIN_PASSWORD=tu_admin_password
SITE_NAME=erp.tudominio.com
HTTP_PORT=8080
```

### Paso 3: Configurar dominio (opcional)
1. En Coolify, ve a **Settings** del proyecto
2. Configura el dominio: `erp.tudominio.com`
3. Habilita SSL con Let's Encrypt

### Paso 4: Deploy
1. Click en **Deploy**
2. Espera 3-5 minutos (la primera vez tarda más)
3. Revisa los logs para ver el progreso

## Acceso

| URL | Descripción |
|-----|-------------|
| `http://tu-ip:8080` | ERPNext |
| Usuario: `Administrator` | |
| Password: `tu_admin_password` | |

## Servicios incluidos

- **frappe**: Backend principal + web server
- **mariadb**: Base de datos
- **redis-cache**: Cache
- **redis-queue**: Cola de trabajos
- **redis-socketio**: WebSockets
- **frappe-worker-***: Workers para background jobs
- **frappe-scheduler**: Tareas programadas

## RAM estimada
~2-3GB total para todos los servicios

## Comandos útiles

### Ver logs
```bash
docker logs frappe-backend -f
```

### Entrar al contenedor
```bash
docker exec -it frappe-backend bash
```

### Crear nuevo sitio
```bash
docker exec -it frappe-backend bench new-site nuevo.sitio.com \
  --db-root-password TU_PASSWORD \
  --admin-password ADMIN_PASSWORD \
  --install-app erpnext
```

### Habilitar CORS para API
```bash
docker exec -it frappe-backend bench --site erp.tudominio.com set-config allow_cors "*"
docker exec -it frappe-backend bench --site erp.tudominio.com set-config ignore_csrf 1
```

## API REST

Una vez instalado, la API está disponible en:

```
POST /api/method/login
GET  /api/resource/DocType
POST /api/resource/DocType
PUT  /api/resource/DocType/name
DELETE /api/resource/DocType/name
```

Ejemplo:
```bash
curl -X POST http://erp.tudominio.com/api/method/login \
  -d "usr=Administrator&pwd=tu_password"
```

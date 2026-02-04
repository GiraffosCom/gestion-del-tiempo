# Deployment de Gestion del Tiempo - Frappe Backend

## Requisitos Previos

- Docker y Docker Compose instalados
- Al menos 4GB de RAM disponible
- Puerto 8080 disponible

## Estructura de Archivos

```
frappe-backend/
├── docker-compose.yml          # Configuracion de Docker existente
├── apps/
│   └── gestion_tiempo/         # App custom para copiar al contenedor
│       ├── setup.py
│       ├── requirements.txt
│       └── gestion_tiempo/
│           ├── __init__.py
│           ├── hooks.py
│           ├── api.py
│           ├── tasks.py
│           ├── modules.txt
│           ├── config/
│           │   └── desktop.py
│           ├── fixtures/
│           │   └── subscription_plans.json
│           └── gestion_tiempo/
│               └── doctype/
│                   ├── customer/
│                   ├── subscription_plan/
│                   ├── subscription/
│                   ├── payment/
│                   └── usage_log/
```

## Pasos de Instalacion

### 1. Iniciar los contenedores base

```bash
cd frappe-backend
docker-compose up -d
```

Esperar a que todos los servicios esten listos (puede tomar varios minutos la primera vez).

### 2. Verificar que el sitio fue creado

```bash
docker-compose logs create-site
```

Buscar el mensaje "Site gestion.localhost created".

### 3. Copiar la app al contenedor

```bash
# Copiar el directorio de la app
docker cp apps/gestion_tiempo backend:/home/frappe/frappe-bench/apps/

# Entrar al contenedor
docker exec -it backend bash
```

### 4. Instalar la app (dentro del contenedor)

```bash
# Navegar al directorio de bench
cd /home/frappe/frappe-bench

# Instalar la app
bench --site gestion.localhost install-app gestion_tiempo

# Cargar los fixtures (planes de suscripcion)
bench --site gestion.localhost import-fixtures
```

### 5. Configurar CORS para el frontend

```bash
# Habilitar CORS para permitir requests desde el frontend
bench --site gestion.localhost set-config allow_cors "*"

# Reiniciar para aplicar cambios
bench restart
```

### 6. Crear usuario administrador (opcional)

```bash
bench --site gestion.localhost add-user admin@gestiontiempo.app --first-name Admin --last-name User
```

## Verificacion

### Verificar API disponible

```bash
curl http://localhost:8080/api/method/ping
```

Debe responder: `{"message":"pong"}`

### Verificar app instalada

```bash
curl http://localhost:8080/api/method/gestion_tiempo.api.get_subscription_plans
```

Debe retornar los planes: Free, Pro, Teams.

### Acceder al panel de Frappe

- URL: http://localhost:8080
- Usuario: Administrator
- Password: admin123 (definido en docker-compose.yml)

## Configuracion del Frontend

En el backoffice (`backoffice.html`), ir a Configuracion y establecer la URL del backend:

```
http://localhost:8080
```

O en produccion, usar la URL del servidor donde esta deployado Frappe.

## API Endpoints Disponibles

### Publicos (allow_guest)
- `GET /api/method/gestion_tiempo.api.get_subscription_plans`
- `GET /api/method/gestion_tiempo.api.check_subscription_status?email=...`

### Autenticados
- `GET /api/method/gestion_tiempo.api.get_dashboard_stats`
- `GET /api/method/gestion_tiempo.api.get_customers_list`
- `GET /api/method/gestion_tiempo.api.get_customer_details?customer_email=...`
- `GET /api/method/gestion_tiempo.api.get_subscriptions_list`
- `GET /api/method/gestion_tiempo.api.get_payments_list`
- `POST /api/method/gestion_tiempo.api.create_subscription`
- `POST /api/method/gestion_tiempo.api.cancel_subscription`
- `POST /api/method/gestion_tiempo.api.upgrade_plan`
- `POST /api/method/gestion_tiempo.api.extend_subscription`
- `POST /api/method/gestion_tiempo.api.process_payment`
- `GET /api/method/gestion_tiempo.api.export_report`

### CRUD basico (via API de Frappe)
- `GET /api/resource/Customer`
- `POST /api/resource/Customer`
- `PUT /api/resource/Customer/{name}`
- `DELETE /api/resource/Customer/{name}`

Lo mismo aplica para Subscription Plan, Subscription, Payment, Usage Log.

## Troubleshooting

### Error "Site not found"

```bash
docker exec -it backend bench --site gestion.localhost migrate
```

### Error de permisos

```bash
docker exec -it backend chown -R frappe:frappe /home/frappe/frappe-bench/apps/gestion_tiempo
```

### Reiniciar todos los servicios

```bash
docker-compose down
docker-compose up -d
```

### Ver logs

```bash
docker-compose logs -f backend
```

## Produccion

Para produccion, modificar:

1. **docker-compose.yml**: Cambiar passwords por valores seguros
2. **CORS**: Especificar dominio exacto en lugar de "*"
3. **SSL**: Configurar nginx con certificado SSL
4. **Backups**: Configurar backups automaticos de MariaDB

### Ejemplo CORS para produccion

```bash
bench --site gestion.localhost set-config allow_cors "https://tu-dominio.com"
```

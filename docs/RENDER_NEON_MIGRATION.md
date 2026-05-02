# Migracion a Render + Neon

Esta guia mueve la tienda estable fuera de EC2 sin incluir los experimentos de IA/Ollama de `origin/main`.

## Arquitectura objetivo

- Frontend: Static Site en Render, o Cloudflare Pages si prefieres.
- Backend: Web Service en Render, plan Starter.
- Base de datos: Neon Postgres.
- Dominio: mantener `dtorreshaus.com` para frontend y usar `api.dtorreshaus.com` para backend.

## Variables del backend

Configura estas variables en Render:

```env
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require
FRONTEND_URL=https://dtorreshaus.com
CORS_ORIGINS=https://dtorreshaus.com,https://www.dtorreshaus.com
BACKEND_URL=https://api.dtorreshaus.com

WOMPI_PUBLIC_KEY=
WOMPI_PRIVATE_KEY=
WOMPI_EVENTS_SECRET=
WOMPI_INTEGRITY_SECRET=

MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_ACCESS_TOKEN=

ENVIA_API_KEY=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=ventas@dtorreshaus.com

ADMIN_PASSWORD=
ADMIN_EMAIL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

## Variables del frontend

```env
VITE_API_URL=https://api.dtorreshaus.com
```

## Pasos

1. Crear una base de datos en Neon y copiar la connection string con `sslmode=require`.
2. Crear el backend en Render desde este repo usando `render.yaml`.
3. En Render, configurar las variables del backend.
4. Ejecutar `npm run db:deploy` en el backend una vez para crear tablas en Neon.
5. Crear el frontend en Render y configurar `VITE_API_URL`.
6. Apuntar `api.dtorreshaus.com` al backend de Render.
7. Apuntar `dtorreshaus.com` y `www.dtorreshaus.com` al frontend.
8. Actualizar webhooks externos:
   - Wompi: `https://api.dtorreshaus.com/api/webhooks/wompi`
   - MercadoPago: `https://api.dtorreshaus.com/api/webhooks/mercadopago`
   - Envia: `https://api.dtorreshaus.com/api/webhooks/envia`
9. Probar `/health`, checkout, admin, ordenes y webhooks.
10. Cuando todo funcione, apagar EC2. Borra snapshots/EBS solo cuando confirmes que no necesitas rollback.

## IA experimental

La rama `origin/main` agrega recomendaciones con Ollama local. Esa parte no entra en esta migracion porque requiere un proceso extra (`ollama`) y un modelo pesado. Si se quiere retomar luego, conviene reemplazarla por una API externa o ponerla detras de una variable como `ENABLE_AI_RECOMMENDATIONS=false`.

# Configuración del Webhook de Envia.com

## ✅ Webhook Implementado

Ya está implementado el endpoint para recibir notificaciones de Envia.com cuando cambia el estado de los envíos.

**Endpoint:** `https://dtorreshaus.com/api/webhooks/envia`

## 🔧 Configuración en Envia.com

### 1. Ingresar al Panel de Envia.com

1. Ve a https://envia.com
2. Inicia sesión con tu cuenta
3. Ve a **Configuración** → **Webhooks** o **API Settings**

### 2. Crear el Webhook `onShipmentStatusUpdate`

Configura el webhook con estos datos:

- **Tipo:** `onShipmentStatusUpdate`
- **URL:** `https://dtorreshaus.com/api/webhooks/envia`
- **Método:** `POST`
- **Formato:** `JSON`

### 3. Eventos que Notificará

El webhook enviará notificaciones cuando:

- 📦 **in_transit** - El paquete está en tránsito
- 🚚 **out_for_delivery** - El paquete está en reparto (salió para entrega)
- ✅ **delivered** - El paquete fue entregado
- ⚠️ **failed_attempt** - Intento de entrega fallido
- 🔙 **returned** - Paquete devuelto al remitente

## 📊 ¿Qué Hace el Webhook?

Cuando Envia.com envía una notificación:

1. **Busca la orden** por el número de tracking
2. **Actualiza el estado** de la orden en la base de datos
3. **Guarda historial completo** de todos los cambios de estado
4. **Envía emails automáticos** al cliente cuando:
   - ✅ El paquete es entregado

### Estados de Orden Mapeados

| Estado Envia.com | Estado en dtorreshaus | Email al Cliente |
|-----------------|----------------------|------------------|
| `in_transit` | `shipped` | ❌ No |
| `out_for_delivery` | `shipped` | ❌ No |
| `delivered` | `delivered` | ✅ Sí |
| `failed_attempt` | `shipped` | ❌ No (puede agregarse) |
| `returned` | `shipped` | ❌ No (puede agregarse) |

## 🧪 Probar el Webhook

### Opción 1: Webhook de Prueba desde Envia.com

Envia.com debería tener una opción para "Test Webhook" donde puedes enviar una notificación de prueba.

### Opción 2: Crear un Envío Real

1. Crea una orden de prueba en dtorreshaus
2. Marca como "shipped" desde el panel de admin
3. Espera a que Envia.com envíe actualizaciones del tracking real

### Opción 3: Probar Manualmente con cURL

```bash
curl -X POST https://dtorreshaus.com/api/webhooks/envia \
  -H "Content-Type: application/json" \
  -d '{
    "trackingNumber": "TU_TRACKING_NUMBER_AQUI",
    "status": "in_transit",
    "carrier": "fedex",
    "statusDate": "2024-01-15T10:30:00Z",
    "location": "Bogotá, Colombia",
    "details": "El paquete está en tránsito"
  }'
```

## 📝 Logs del Webhook

Los webhooks se registran en los logs del servidor. Para ver los logs:

```bash
ssh dtorreshaus
pm2 logs dtorreshaus-backend
```

Busca líneas como:
- `📨 Webhook Envia.com recibido:`
- `📦 Orden encontrada: DTH-xxxxx - Nuevo estado: delivered`
- `✉️ Email de entrega enviado a cliente@example.com`

## 🔐 Seguridad

**IMPORTANTE:** Actualmente el webhook NO verifica la firma de Envia.com.

Si Envia.com proporciona un secret key o firma para validar webhooks, debes agregarlo al código en `backend/routes/webhooks.js` (línea 150+) similar a como se hace con Wompi.

## 🎯 Próximos Pasos Opcionales

### 1. Agregar Email de "Paquete en Tránsito"

Si quieres notificar al cliente cuando el paquete salga de origen:

1. Crea la función `sendOrderInTransit()` en `email.service.js`
2. Descomenta la línea 253 en `webhooks.js`

### 2. Agregar Email de "Intento Fallido"

Para notificar intentos fallidos de entrega:

1. Crea la función `sendOrderFailedAttempt()` en `email.service.js`
2. Agrega el código en la línea 259 de `webhooks.js`

### 3. Webhook de Surcharge (Cargos Adicionales)

Si quieres recibir notificaciones de cargos adicionales por peso/dimensiones incorrectas, necesitarías:

1. Crear otro endpoint `/api/webhooks/envia-surcharge`
2. Configurarlo en Envia.com como tipo `surcharge`
3. Guardar los cargos adicionales y notificar al admin

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `pm2 logs`
2. Verifica que el tracking number en Envia coincida con el de la base de datos
3. Prueba el endpoint manualmente con cURL
4. Verifica que la URL esté configurada correctamente en Envia.com

---

**Implementado:** 2024
**Última actualización:** 2024

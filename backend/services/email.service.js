const nodemailer = require('nodemailer')

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Verificar configuración
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Error en configuración de email:', error.message)
  } else {
    console.log('✅ Servidor de email listo para enviar mensajes')
  }
})

/**
 * Email de confirmación de pedido (con instrucciones de pago)
 */
async function sendOrderConfirmation(order) {
  const { customerEmail, customerName, reference, total, paymentMethod, cart, shippingCost } = order

  let paymentInstructions = ''

  if (paymentMethod === 'transfer') {
    paymentInstructions = `
      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
        <h3 style="color: #92400e; margin-top: 0;">📱 Instrucciones de Pago</h3>
        <p style="margin: 10px 0;"><strong>Nequi:</strong> ${process.env.NEQUI_PHONE}</p>
        <p style="margin: 10px 0;"><strong>A nombre de:</strong> ${process.env.NEQUI_NAME}</p>
        <p style="margin: 10px 0;"><strong>Valor:</strong> $${total.toLocaleString('es-CO')}</p>
        <p style="margin: 10px 0;"><strong>Referencia:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${reference}</code></p>
        <p style="margin-top: 15px; font-size: 14px;">
          ⚠️ Por favor envía el comprobante de pago a nuestro WhatsApp para confirmar tu pedido.
        </p>
      </div>
    `
  }

  const productsHTML = cart.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.nombre}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.precio.toLocaleString('es-CO')}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.precio * item.quantity).toLocaleString('es-CO')}</td>
    </tr>
  `).join('')

  // Calcular subtotal de productos
  const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0)
  const shipping = shippingCost || 0

  const mailOptions = {
    from: `"dtorreshaus" <${process.env.EMAIL_FROM}>`,
    to: customerEmail,
    subject: `Pedido #${reference} - Confirmación`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏠 dtorreshaus</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e293b; margin-top: 0;">¡Hola ${customerName}!</h2>
          <p>Gracias por tu pedido. Hemos recibido tu orden y está siendo procesada.</p>

          ${paymentInstructions}

          <h3 style="color: #1e293b; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">📦 Resumen de tu Pedido</h3>
          <p><strong>Número de Pedido:</strong> ${reference}</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #6366f1;">Producto</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #6366f1;">Cant.</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #6366f1;">Precio</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #6366f1;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${productsHTML}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;">Subtotal Productos:</td>
                <td style="padding: 10px; text-align: right;">$${subtotal.toLocaleString('es-CO')}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;">Costo de Envío:</td>
                <td style="padding: 10px; text-align: right;">$${shipping.toLocaleString('es-CO')}</td>
              </tr>
              <tr style="border-top: 2px solid #6366f1;">
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">TOTAL:</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #ec4899;">$${total.toLocaleString('es-CO')}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">
              💡 <strong>Tip:</strong> Puedes consultar el estado de tu pedido en cualquier momento visitando:<br>
              <a href="${process.env.FRONTEND_URL}/order/${reference}" style="color: #6366f1;">
                ${process.env.FRONTEND_URL}/order/${reference}
              </a>
            </p>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Si tienes alguna pregunta, no dudes en contactarnos.<br>
            <strong>Email:</strong> ${process.env.EMAIL_FROM}
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
          <p>© 2024 dtorreshaus - Tu tienda de confianza para artículos del hogar</p>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email de confirmación enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Email de pago confirmado
 */
async function sendPaymentConfirmed(order) {
  const { customerEmail, customerName, reference } = order

  const mailOptions = {
    from: `"dtorreshaus" <${process.env.EMAIL_FROM}>`,
    to: customerEmail,
    subject: `Pedido #${reference} - Pago Confirmado ✅`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">✅ Pago Confirmado</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1e293b;">¡Hola ${customerName}!</h2>
          <p>Hemos confirmado tu pago para el pedido <strong>#${reference}</strong>.</p>

          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border: 2px solid #10b981; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-size: 16px;">
              🎉 Tu pedido está siendo preparado para el envío. Te notificaremos cuando sea despachado.
            </p>
          </div>

          <p>Puedes seguir el estado de tu pedido aquí:</p>
          <a href="${process.env.FRONTEND_URL}/order/${reference}"
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            Ver Estado del Pedido
          </a>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email de pago confirmado enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error enviando email de pago confirmado:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Email de pedido enviado (con tracking)
 */
async function sendOrderShipped(order, trackingInfo) {
  const { customerEmail, customerName, reference } = order
  const { trackingNumber, carrier, estimatedDelivery } = trackingInfo

  const mailOptions = {
    from: `"dtorreshaus" <${process.env.EMAIL_FROM}>`,
    to: customerEmail,
    subject: `Pedido #${reference} - Enviado 📦`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">📦 Pedido Enviado</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1e293b;">¡Hola ${customerName}!</h2>
          <p>Tu pedido <strong>#${reference}</strong> ha sido enviado y está en camino.</p>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border: 2px solid #f59e0b; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">📍 Información de Envío</h3>
            <p><strong>Número de seguimiento:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${trackingNumber}</code></p>
            <p><strong>Transportadora:</strong> ${carrier}</p>
            ${estimatedDelivery ? `<p><strong>Entrega estimada:</strong> ${estimatedDelivery}</p>` : ''}
          </div>

          <p>Puedes rastrear tu paquete aquí:</p>
          <a href="${process.env.FRONTEND_URL}/order/${reference}"
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
            Rastrear Pedido
          </a>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email de envío enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error enviando email de envío:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Email de pedido entregado
 */
async function sendOrderDelivered(order) {
  const { customerEmail, customerName, reference } = order

  const mailOptions = {
    from: `"dtorreshaus" <${process.env.EMAIL_FROM}>`,
    to: customerEmail,
    subject: `Pedido #${reference} - Entregado ✅`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 48px;">🎉</h1>
          <h2 style="color: white; margin: 10px 0 0 0;">¡Pedido Entregado!</h2>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1e293b;">¡Hola ${customerName}!</h2>
          <p>Tu pedido <strong>#${reference}</strong> ha sido entregado exitosamente.</p>

          <p style="font-size: 16px;">Esperamos que disfrutes de tus productos. ¡Gracias por confiar en nosotros!</p>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #64748b;">
            Si tienes algún problema con tu pedido, no dudes en contactarnos.
          </p>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email de entrega enviado:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Error enviando email de entrega:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  sendOrderConfirmation,
  sendPaymentConfirmed,
  sendOrderShipped,
  sendOrderDelivered
}

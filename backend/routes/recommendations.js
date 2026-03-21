/**
 * ====================================
 * RUTAS DE RECOMENDACIONES (IA)
 * ====================================
 * Endpoints para obtener recomendaciones de productos generadas por IA
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const ollamaService = require('../services/ollama.service');

const prisma = new PrismaClient();

/**
 * GET /api/recommendations/general
 * Obtiene recomendaciones generales basadas en todos los productos activos
 */
router.get('/general', async (req, res) => {
  try {
    // 1. Obtener todos los productos activos
    const products = await prisma.product.findMany({
      where: { active: true },
      select: {
        sku: true,
        nombre: true,
        descripcion: true,
        categoria: true,
        precio: true,
        emoji: true
      }
    });

    if (products.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        message: 'No hay productos activos para recomendar.'
      });
    }

    // 2. Preparar el prompt para la IA
    const productListText = products.map(p => 
      `- [${p.sku}] ${p.nombre}: ${p.descripcion} (Categoría: ${p.categoria}, Precio: $${p.precio})`
    ).join('\n');

    const prompt = `
Aquí tienes una lista de productos de mi tienda ecommerce:
${productListText}

Basado en esta lista, por favor recomienda los 4 productos más interesantes o populares.
Para cada recomendación, explica brevemente por qué lo recomiendas.
Tu respuesta DEBE ser exclusivamente un JSON válido con el siguiente formato, sin texto adicional antes o después:
{
  "recommendations": [
    {
      "sku": "SKU_DEL_PRODUCTO",
      "reason": "Razón de la recomendación en una frase corta"
    }
  ]
}
`;

    const systemPrompt = "Eres un asistente de compras inteligente para la tienda 'dtorreshaus'. Tu objetivo es ayudar a los clientes a encontrar productos que les gusten. Responde siempre en español y en formato JSON.";

    // 3. Llamar a Ollama
    const aiResponse = await ollamaService.generateResponse(prompt, systemPrompt);
    
    // 4. Procesar y limpiar la respuesta (a veces los modelos incluyen texto extra)
    let recommendations = [];
    try {
      // Intentar extraer el JSON si el modelo incluyó texto extra
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      } else {
        throw new Error("No se encontró JSON en la respuesta de la IA");
      }
    } catch (parseError) {
      console.error('Error parseando respuesta de IA:', aiResponse);
      return res.status(500).json({
        success: false,
        error: 'Error procesando la respuesta de la IA',
        raw: aiResponse
      });
    }

    // 5. Enriquecer las recomendaciones con los datos completos del producto
    const enrichedRecommendations = recommendations.map(rec => {
      const product = products.find(p => p.sku === rec.sku);
      return product ? { ...product, reason: rec.reason } : null;
    }).filter(p => p !== null);

    res.json({
      success: true,
      data: enrichedRecommendations
    });

  } catch (error) {
    console.error('Error en recomendaciones generales:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar recomendaciones',
      message: error.message
    });
  }
});

/**
 * POST /api/recommendations/personalized
 * Obtiene recomendaciones personalizadas basadas en el carrito actual (Cross-selling)
 */
router.post('/personalized', async (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart || cart.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'El carrito está vacío.'
      });
    }

    // 1. Obtener todos los productos activos (para que la IA elija de ahí)
    const allProducts = await prisma.product.findMany({
      where: { active: true },
      select: {
        sku: true,
        nombre: true,
        descripcion: true,
        categoria: true,
        precio: true,
        emoji: true
      }
    });

    // 2. Preparar el contexto del carrito
    const cartItemsText = cart.map(item => `- ${item.nombre} (SKU: ${item.sku})`).join('\n');
    const availableProductsText = allProducts
      .filter(p => !cart.some(cartItem => cartItem.sku === p.sku)) // Excluir lo que ya está en el carrito
      .map(p => `- [${p.sku}] ${p.nombre}: ${p.descripcion} (Categoría: ${p.categoria})`)
      .slice(0, 15) // Limitar a 15 para no saturar el prompt
      .join('\n');

    const prompt = `
El cliente tiene los siguientes productos en su carrito de compras:
${cartItemsText}

Basado en lo que ya lleva, recomienda 3 productos ADICIONALES de esta lista que complementen su compra (Cross-selling):
${availableProductsText}

Tu respuesta DEBE ser exclusivamente un JSON válido con el siguiente formato:
{
  "recommendations": [
    {
      "sku": "SKU_DEL_PRODUCTO",
      "reason": "Una frase corta de por qué este producto combina con lo que ya tiene en el carrito"
    }
  ]
}
`;

    const systemPrompt = "Eres un experto en ventas cruzadas (cross-selling) para la tienda 'dtorreshaus'. Tu objetivo es sugerir productos que aporten valor a lo que el cliente ya eligió. Responde siempre en español y en JSON.";

    // 3. Llamar a Ollama
    const aiResponse = await ollamaService.generateResponse(prompt, systemPrompt);
    
    // 4. Procesar respuesta
    let recommendations = [];
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        recommendations = parsed.recommendations || [];
      }
    } catch (e) {
      console.error('Error parseando IA personalizada:', e);
    }

    // 5. Enriquecer
    const enriched = recommendations.map(rec => {
      const product = allProducts.find(p => p.sku === rec.sku);
      return product ? { ...product, reason: rec.reason } : null;
    }).filter(p => p !== null);

    res.json({
      success: true,
      data: enriched,
      isPersonalized: true
    });

  } catch (error) {
    console.error('Error en recomendaciones personalizadas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

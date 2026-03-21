const ollamaService = require('./ollama.service');

/**
 * Analiza un lote de interacciones (clicks, tiempo, etc.) 
 * de un usuario anónimo para clasificar su comportamiento.
 */
async function classifyUserInteractions(interactions) {
  if (!interactions || interactions.length === 0) {
    return { label: "Usuario Nuevo", probability: 10 };
  }

  const interactionsText = interactions.map(i => 
    `- Acción: ${i.action}, Item: ${i.item || 'N/A'}, Categoria: ${i.category || 'N/A'}, Tiempo estimado: ${i.duration || 0}s`
  ).join('\n');

  const prompt = `
Actúa como un experto analizador de comportamiento de usuarios ecommerce. Aquí están las interacciones recientes de un usuario:
${interactionsText}

Evalúa la secuencia y el tiempo, y asígnale UNA de las siguientes etiquetas semánticas:
- Cazador de Ofertas
- Comprador Impulsivo 
- Investigador Meticuloso
- Indeciso

Y una probabilidad de compra entre 0 y 100.

Devuelve ESTRICTAMENTE un JSON con esta estructura (sin texto adicional ni markdown):
{
  "label": "Etiqueta asignada",
  "probability": 80
}
  `;

  try {
    const response = await ollamaService.generateResponse(prompt);
    
    // Intentar extraer el JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback si la IA no devuelve JSON
    return { label: "Indeciso", probability: 30 };
  } catch (error) {
    console.error("Error en Lead Scoring Service:", error.message);
    return { label: "Usuario Nuevo", probability: 10 };
  }
}

module.exports = {
  classifyUserInteractions
};

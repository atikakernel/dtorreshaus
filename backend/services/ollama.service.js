/**
 * ====================================
 * OLLAMA SERVICE
 * ====================================
 * Servicio para interactuar con la API local de Ollama
 */

const axios = require('axios');
const { aiQueue } = require('./queue.service');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:14b';

/**
 * Enviar un prompt a Ollama y obtener la respuesta
 * @param {string} prompt - El mensaje para el modelo
 * @param {string} systemPrompt - Instrucciones del sistema
 * @returns {Promise<string>} La respuesta del modelo
 */
async function generateResponse(prompt, systemPrompt = 'Eres un experto en recomendaciones de productos para un ecommerce.') {
  try {
    const response = await aiQueue.enqueue(() => 
      axios.post(`${OLLAMA_URL}/api/generate`, {
        model: OLLAMA_MODEL,
        prompt: prompt,
        system: systemPrompt,
        stream: false,
      })
    );

    return response.data.response;
  } catch (error) {
    console.error('Error llamando a Ollama:', error.message);
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`No se pudo conectar con Ollama en ${OLLAMA_URL}. Asegúrate de que Ollama esté corriendo.`);
    }
    throw error;
  }
}

/**
 * Enviar un chat a Ollama (soporta historial)
 * @param {Array} messages - Lista de mensajes {role, content}
 * @returns {Promise<Object>} La respuesta completa del chat
 */
async function chat(messages) {
  try {
    const response = await aiQueue.enqueue(() => 
      axios.post(`${OLLAMA_URL}/api/chat`, {
        model: OLLAMA_MODEL,
        messages: messages,
        stream: false,
      })
    );

    return response.data.message;
  } catch (error) {
    console.error('Error en el chat con Ollama:', error.message);
    throw error;
  }
}

module.exports = {
  generateResponse,
  chat
};
